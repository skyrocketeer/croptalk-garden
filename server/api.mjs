import { randomUUID } from 'node:crypto'

export const GARDEN_SESSION_COOKIE = 'garden_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5
const DEFAULT_GARDEN_TENANT_ID = 'dbbe2b0f-d686-459d-9de1-d46696841758'
const MAX_BODY_BYTES = 16 * 1024
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const json = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end(JSON.stringify(body))
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.cookie ?? ''
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim())
    }
  }
  return ''
}

async function readJSON(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request body is too large.'), { status: 413 })
    chunks.push(chunk)
  }
  if (size === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 })
  }
}

function originAllowed(request) {
  const origin = request.headers.origin
  if (!origin) return true
  const host = request.headers.host
  try {
    return Boolean(host) && new URL(origin).host.toLowerCase() === String(host).toLowerCase()
  } catch {
    return false
  }
}

function cookieHeader(token, secure) {
  return `${GARDEN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure ? '; Secure' : ''}`
}

function clearedCookieHeader(secure) {
  return `${GARDEN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
}

function cleanCustomer(user) {
  return {
    id: String(user?.id ?? ''),
    email: String(user?.email ?? ''),
    name: String(user?.name ?? ''),
    role: String(user?.role ?? '').toUpperCase(),
  }
}

async function upstreamJSON(fetchImpl, url, init) {
  const response = await fetchImpl(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(10000) })
  const body = await response.json().catch(() => null)
  return { response, body }
}

function upstreamError(response, body, fallback) {
  return {
    status: response.status >= 400 && response.status < 500 ? response.status : 502,
    code: typeof body?.error?.code === 'string' ? body.error.code : typeof body?.code === 'string' ? body.code : fallback,
    message: typeof body?.error?.message === 'string' ? body.error.message : typeof body?.message === 'string' ? body.message : 'A connected Croptalk service is unavailable.',
  }
}

export function createGardenApiHandler({
  env = process.env,
  fetchImpl = fetch,
  logger = console,
} = {}) {
  const secure = env.NODE_ENV === 'production'
  const crmBase = String(env.CRM_SERVICE_URL ?? '').replace(/\/+$/, '')
  const cultivationBase = String(env.CULTIVATION_SERVICE_URL ?? '').replace(/\/+$/, '')
  const tenantId = DEFAULT_GARDEN_TENANT_ID

  return async function handleGardenAPI(request, response) {
    const url = new URL(request.url ?? '/', 'http://garden.local')
    if (!url.pathname.startsWith('/api/')) return false

    if (request.method === 'OPTIONS') {
      response.writeHead(204, { 'Cache-Control': 'no-store' })
      response.end()
      return true
    }

    const mutating = request.method !== 'GET' && request.method !== 'HEAD'
    if (mutating && !originAllowed(request)) {
      json(response, 403, { code: 'origin_denied', message: 'Request origin is not allowed.' })
      return true
    }

    try {
      if (url.pathname === '/api/auth/session' && request.method === 'POST') {
        if (!crmBase || !UUID_PATTERN.test(tenantId)) {
          json(response, 503, { code: 'garden_auth_unavailable', message: 'Garden sign-in is not configured.' })
          return true
        }
        const body = await readJSON(request)
        if (typeof body.idToken !== 'string' || body.idToken.length < 20 || body.idToken.length > 12000) {
          json(response, 400, { code: 'invalid_input', message: 'A valid Firebase ID token is required.' })
          return true
        }
        const { response: crmResponse, body: crmBody } = await upstreamJSON(fetchImpl, `${crmBase}/auth/firebase/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseToken: body.idToken, audience: 'storefront', tenantId }),
        })
        if (!crmResponse.ok || typeof crmBody?.accessToken !== 'string') {
          const failure = upstreamError(crmResponse, crmBody, 'customer_account_required')
          json(response, failure.status, failure)
          return true
        }
        const customer = cleanCustomer(crmBody.user)
        if (customer.role !== 'CUSTOMER' || !customer.id) {
          json(response, 403, { code: 'customer_account_required', message: 'A Croptalk customer account is required.' })
          return true
        }
        json(response, 200, { user: customer }, { 'Set-Cookie': cookieHeader(crmBody.accessToken, secure) })
        return true
      }

      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const token = cookieValue(request, GARDEN_SESSION_COOKIE)
        if (!token) {
          json(response, 401, { code: 'unauthenticated', message: 'Sign in to open your garden.' })
          return true
        }
        if (!crmBase) {
          json(response, 503, { code: 'garden_auth_unavailable', message: 'Garden sign-in is not configured.' })
          return true
        }
        const { response: crmResponse, body: crmBody } = await upstreamJSON(fetchImpl, `${crmBase}/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!crmResponse.ok) {
          const failure = upstreamError(crmResponse, crmBody, 'customer_session_unavailable')
          json(response, failure.status, failure, { 'Set-Cookie': clearedCookieHeader(secure) })
          return true
        }
        const customer = cleanCustomer(crmBody)
        if (customer.role !== 'CUSTOMER' || !customer.id) {
          json(response, 403, { code: 'customer_account_required', message: 'A Croptalk customer account is required.' }, { 'Set-Cookie': clearedCookieHeader(secure) })
          return true
        }
        json(response, 200, { user: customer })
        return true
      }

      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        json(response, 200, { ok: true }, { 'Set-Cookie': clearedCookieHeader(secure) })
        return true
      }

      const token = cookieValue(request, GARDEN_SESSION_COOKIE)
      if (!token) {
        json(response, 401, { code: 'unauthenticated', message: 'Sign in to open your garden.' })
        return true
      }
      if (!cultivationBase || !UUID_PATTERN.test(tenantId)) {
        json(response, 503, { code: 'garden_data_unavailable', message: 'Garden data is not configured.' })
        return true
      }
      const headers = { Authorization: `Bearer ${token}`, 'X-Organization-ID': tenantId, 'X-Request-ID': randomUUID() }

      if (url.pathname === '/api/garden/plots' && request.method === 'GET') {
        const { response: serviceResponse, body } = await upstreamJSON(fetchImpl, `${cultivationBase}/v1/customer/plots`, { headers })
        if (!serviceResponse.ok) {
          const failure = upstreamError(serviceResponse, body, 'garden_plots_unavailable')
          json(response, failure.status, failure)
          return true
        }
        json(response, 200, { items: Array.isArray(body?.items) ? body.items : [] })
        return true
      }

      if (url.pathname === '/api/garden/irrigation-operations' && request.method === 'GET') {
        const plotID = url.searchParams.get('plot_id')
        if (!plotID || !UUID_PATTERN.test(plotID)) {
          json(response, 400, { code: 'invalid_input', message: 'A valid plot ID is required.' })
          return true
        }
        const { response: serviceResponse, body } = await upstreamJSON(fetchImpl, `${cultivationBase}/v1/customer/irrigation-operations?plot_id=${encodeURIComponent(plotID)}`, { headers })
        if (!serviceResponse.ok) {
          const failure = upstreamError(serviceResponse, body, 'garden_operations_unavailable')
          json(response, failure.status, failure)
          return true
        }
        json(response, 200, { items: Array.isArray(body?.items) ? body.items : [] })
        return true
      }

      if (url.pathname === '/api/garden/irrigation-operations' && request.method === 'POST') {
        const body = await readJSON(request)
        if (typeof body.plot_id !== 'string' || !UUID_PATTERN.test(body.plot_id) || typeof body.idempotency_key !== 'string' || !UUID_PATTERN.test(body.idempotency_key)) {
          json(response, 400, { code: 'invalid_input', message: 'A valid plot ID and request key are required.' })
          return true
        }
        const { response: serviceResponse, body: result } = await upstreamJSON(fetchImpl, `${cultivationBase}/v1/customer/plots/${encodeURIComponent(body.plot_id)}/irrigation-operations`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json', 'Idempotency-Key': body.idempotency_key },
          body: JSON.stringify({ note: typeof body.note === 'string' ? body.note.slice(0, 500) : '' }),
        })
        if (!serviceResponse.ok) {
          const failure = upstreamError(serviceResponse, result, 'irrigation_request_failed')
          json(response, failure.status, failure)
          return true
        }
        json(response, serviceResponse.status, result)
        return true
      }

      const operationMatch = url.pathname.match(/^\/api\/garden\/irrigation-operations\/([0-9a-f-]+)$/i)
      if (operationMatch && request.method === 'GET') {
        const operationID = operationMatch[1]
        if (!UUID_PATTERN.test(operationID)) {
          json(response, 400, { code: 'invalid_input', message: 'Operation ID is invalid.' })
          return true
        }
        const { response: serviceResponse, body } = await upstreamJSON(fetchImpl, `${cultivationBase}/v1/customer/irrigation-operations/${encodeURIComponent(operationID)}`, { headers })
        if (!serviceResponse.ok) {
          const failure = upstreamError(serviceResponse, body, 'garden_operation_unavailable')
          json(response, failure.status, failure)
          return true
        }
        json(response, 200, body)
        return true
      }

      json(response, 404, { code: 'not_found', message: 'Garden API route not found.' })
      return true
    } catch (error) {
      logger.error?.('Garden BFF request failed', { path: url.pathname, error: error instanceof Error ? error.message : 'unknown' })
      const status = Number.isInteger(error?.status) ? error.status : 502
      json(response, status, { code: status === 413 ? 'payload_too_large' : 'garden_service_unavailable', message: status === 413 ? 'Request body is too large.' : 'A Croptalk service is temporarily unavailable.' })
      return true
    }
  }
}
