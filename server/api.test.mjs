import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import test from 'node:test'
import { createGardenApiHandler, GARDEN_SESSION_COOKIE } from './api.mjs'

class Request extends Readable {
  constructor({ method = 'GET', url = '/', headers = {}, body = '' } = {}) {
    super()
    this.method = method
    this.url = url
    this.headers = headers
    this.body = Buffer.from(body)
  }

  _read() {
    this.push(this.body)
    this.push(null)
  }
}

class Response {
  headers = {}
  status = 0
  body = ''

  writeHead(status, headers = {}) {
    this.status = status
    this.headers = headers
  }

  end(body = '') {
    this.body = body.toString()
  }
}

const env = {
  CRM_SERVICE_URL: 'http://crm.test',
  CULTIVATION_SERVICE_URL: 'http://cultivation.test',
  NODE_ENV: 'development',
}

const HYDROWORKS_TENANT_ID = 'dbbe2b0f-d686-459d-9de1-d46696841758'

test('Hydroworks is the default server-side tenant', async () => {
  let exchange
  const handler = createGardenApiHandler({
    env: { ...env, GARDEN_TENANT_ID: 'ffffffff-ffff-4fff-8fff-ffffffffffff' },
    fetchImpl: async (_url, init) => {
      exchange = JSON.parse(init.body)
      return new ResponseMock(200, { accessToken: 'crm-private-token', user: { id: 'customer-1', role: 'CUSTOMER' } })
    },
  })
  const request = new Request({
    method: 'POST',
    url: '/api/auth/session',
    headers: { host: 'garden.test', origin: 'http://garden.test', 'content-type': 'application/json' },
    body: JSON.stringify({ idToken: 'firebase-id-token-long-enough' }),
  })
  const response = new Response()
  await handler(request, response)

  assert.equal(response.status, 200)
  assert.equal(exchange.tenantId, HYDROWORKS_TENANT_ID)
})

test('customer session exchange stores CRM token only in an HTTP-only cookie', async () => {
  let exchange
  const handler = createGardenApiHandler({
    env,
    fetchImpl: async (url, init) => {
      exchange = { url, body: JSON.parse(init.body) }
      return new ResponseMock(200, { accessToken: 'crm-private-token', user: { id: 'customer-1', email: 'farmer@example.test', name: 'Farmer', role: 'CUSTOMER', status: 'ACTIVE' } })
    },
  })
  const request = new Request({
    method: 'POST',
    url: '/api/auth/session',
    headers: { host: 'garden.test', origin: 'http://garden.test', 'content-type': 'application/json' },
    body: JSON.stringify({ idToken: 'firebase-id-token-long-enough' }),
  })
  const response = new Response()
  await handler(request, response)

  assert.equal(response.status, 200)
  assert.equal(exchange.url, 'http://crm.test/auth/firebase/login')
  assert.equal(exchange.body.audience, 'storefront')
  assert.equal(exchange.body.tenantId, HYDROWORKS_TENANT_ID)
  assert.match(response.headers['Set-Cookie'], new RegExp(`^${GARDEN_SESSION_COOKIE}=`))
  assert.match(response.headers['Set-Cookie'], /HttpOnly/)
  assert.doesNotMatch(response.body, /crm-private-token/)
})

test('customer plot proxy uses the cookie session and server tenant only', async () => {
  let requestHeaders
  const handler = createGardenApiHandler({
    env,
    fetchImpl: async (_url, init) => {
      requestHeaders = init.headers
      return new ResponseMock(200, { items: [{ id: 'plot-1' }] })
    },
  })
  const request = new Request({
    url: '/api/garden/plots',
    headers: { host: 'garden.test', cookie: `${GARDEN_SESSION_COOKIE}=crm-private-token` },
  })
  const response = new Response()
  await handler(request, response)

  assert.equal(response.status, 200)
  assert.deepEqual(JSON.parse(response.body), { items: [{ id: 'plot-1' }] })
  assert.equal(requestHeaders.Authorization, 'Bearer crm-private-token')
  assert.equal(requestHeaders['X-Organization-ID'], HYDROWORKS_TENANT_ID)
})

test('cross-origin mutations are rejected before reaching CRM', async () => {
  let fetchCalled = false
  const handler = createGardenApiHandler({
    env,
    fetchImpl: async () => {
      fetchCalled = true
      throw new Error('must not call upstream')
    },
  })
  const request = new Request({
    method: 'POST',
    url: '/api/auth/session',
    headers: { host: 'garden.test', origin: 'https://attacker.test', 'content-type': 'application/json' },
    body: JSON.stringify({ idToken: 'firebase-id-token-long-enough' }),
  })
  const response = new Response()
  await handler(request, response)

  assert.equal(response.status, 403)
  assert.equal(fetchCalled, false)
})

class ResponseMock {
  constructor(status, body) {
    this.status = status
    this.ok = status >= 200 && status < 300
    this.body = body
  }

  async json() {
    return this.body
  }
}
