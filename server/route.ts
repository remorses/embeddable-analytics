import { fetchTinyBird } from './api'

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
