import { ClientResponse, QueryError } from '../lib/types'

export async function fetchTinyBird<T>({
  host,
  token,
  params,
  path,
}: {
  path: string
  params?: RequestInit
  host
  token
}): Promise<ClientResponse<T>> {
  if (!token || !host) throw new Error('Configuration not found')

  const apiUrl =
    {
      'https://ui.tinybird.co': 'https://api.tinybird.co',
      'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
    }[host] ?? host

  const response = await fetch(`${apiUrl}/v0${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...params,
  })
  const data = (await response.json()) as ClientResponse<T>

  if (!response.ok) {
    throw new QueryError(data?.error ?? 'Something went wrong', response.status)
  }
  return data
}
