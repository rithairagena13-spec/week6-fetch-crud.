const BASE_URL = 'https://jsonplaceholder.typicode.com'
export class HttpError extends Error {
  constructor(status, message, data) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

export async function request(
  path,
  { method = 'GET', body, headers, signal = AbortSignal.timeout(8000) } = {}
) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJSON = response.headers
    .get('content-type')
    ?.includes('application/json')

  const data = isJSON ? await response.json() : null

  if (!response.ok) {
    throw new HttpError(
      response.status,
      data?.message ?? `Request failed (${response.status})`,
      data
    )
  }

  return data
}