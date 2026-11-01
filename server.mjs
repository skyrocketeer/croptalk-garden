import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { createGardenApiHandler } from './server/api.mjs'

const distRoot = resolve(process.cwd(), 'dist')
const gardenAPI = createGardenApiHandler()
const port = Number.parseInt(process.env.PORT ?? '5555', 10)
const host = process.env.HOST ?? '0.0.0.0'

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
}

const server = createServer(async (request, response) => {
  if (request.url?.startsWith('/api/')) {
    await gardenAPI(request, response)
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://garden.local').pathname)
  } catch {
    response.writeHead(400).end()
    return
  }
  const filePath = resolve(distRoot, `.${pathname}`)
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) {
    response.writeHead(403).end()
    return
  }

  try {
    let target = filePath
    let fileInfo = await stat(target)
    if (fileInfo.isDirectory()) {
      target = resolve(target, 'index.html')
      fileInfo = await stat(target)
    }
    if (!fileInfo.isFile()) throw new Error('Not a file')
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(target)] ?? 'application/octet-stream',
      'Content-Length': fileInfo.size,
      'Cache-Control': target.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    response.end(await readFile(target))
  } catch {
    try {
      const index = await readFile(resolve(distRoot, 'index.html'))
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
      response.end(index)
    } catch {
      response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Garden build output is unavailable.')
    }
  }
})

server.listen(port, host, () => {
  console.info(`Croptalk Garden server listening on ${host}:${port}`)
})
