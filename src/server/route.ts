import { ClientResponse, QueryError } from '../lib/types'

export async function getData({
  pipe,
  token,
  namespace,
  date_from,
  date_to,
  limit,
}) {
  const searchParams = new URLSearchParams()
  const params = {
    namespace,
    date_from,
    date_to,
    limit,
  }
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    searchParams.set(key, value)
  })

  const res = await fetchTinyBird({
    host: 'https://api.tinybird.co',
    token,
    path: `/pipes/${pipe}.json?${searchParams.toString()}`,
  })

  return res
}

async function fetchTinyBird<T>({
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
