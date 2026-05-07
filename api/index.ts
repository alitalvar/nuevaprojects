export const config = {
  runtime: 'nodejs',
}

interface NodeRequest {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  [Symbol.asyncIterator]?: () => AsyncIterableIterator<Buffer>
}

interface NodeResponse {
  statusCode: number
  setHeader: (name: string, value: string) => void
  end: (body?: Buffer | string) => void
}

async function readBody(request: NodeRequest) {
  if (request.method === 'GET' || request.method === 'HEAD' || !request[Symbol.asyncIterator]) return undefined
  const chunks: Buffer[] = []
  for await (const chunk of request as AsyncIterable<Buffer>) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function toHeaders(headers: NodeRequest['headers']) {
  const result = new Headers()
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) result.set(key, value.join(', '))
    else if (value) result.set(key, value)
  })
  return result
}

async function runSsr(request: Request) {
  const server = await import('../dist/server/server.js' as string)
  const appHandler = server.default ?? server.handler ?? server.fetch

  if (typeof appHandler === 'function') {
    return appHandler(request)
  }

  if (server.default?.fetch) {
    return server.default.fetch(request)
  }

  return new Response('Nueva SSR handler was not found.', { status: 500 })
}

export default async function handler(request: Request | NodeRequest, response?: NodeResponse) {
  if (!response) return runSsr(request as Request)

  const headers = (request as NodeRequest).headers
  const host = headers['x-forwarded-host'] ?? headers.host ?? 'localhost'
  const protocol = headers['x-forwarded-proto'] ?? 'https'
  const url = new URL(request.url ?? '/', `${protocol}://${Array.isArray(host) ? host[0] : host}`)
  const body = await readBody(request as NodeRequest)
  const webResponse = await runSsr(
    new Request(url, {
      method: request.method,
      headers: toHeaders(headers),
      body,
      duplex: body ? 'half' : undefined,
    } as RequestInit & { duplex?: 'half' }),
  )

  response.statusCode = webResponse.status
  webResponse.headers.forEach((value: string, key: string) => response.setHeader(key, value))
  response.end(Buffer.from(await webResponse.arrayBuffer()))
}
