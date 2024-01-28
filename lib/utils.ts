

export const globalState = {
  namespace: '',
  apiEndpoint: '',
}

export const cx = (...args: (string | undefined | false)[]) =>
  args.filter(Boolean).join(' ')

export const formatNumber = (num: number) => Intl.NumberFormat().format(+num)

export function kFormatter(value: number): string {
  return value > 999 ? `${(value / 1000).toFixed(1)}K` : String(value)
}

export function formatMinSec(totalSeconds: number) {
  if (isNaN(totalSeconds)) return '0s'

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const padTo2Digits = (value: number) => value.toString().padStart(2, '0')
  return `${minutes ? `${minutes}m` : ''} ${padTo2Digits(seconds)}s`
}

export function formatPercentage(value: number) {
  return `${value ? (value * 100).toFixed(2) : '0'}%`
}

export const devices = {
  desktop: 'Desktop',
  'mobile-android': 'Android',
  'mobile-ios': 'iOS',
  bot: 'Bots',
}

export const browsers = {
  chrome: 'Chrome',
  safari: 'Safari',
  opera: 'Opera',
  firefox: 'Firefox',
  ie: 'IE',
}

export async function getPipeFromClient<T>(
  pipe,
  { date_from, date_to, limit = undefined as number | undefined }
): Promise<QueryPipe<T>> {
  const { apiEndpoint, namespace } = globalState
  if (!apiEndpoint) throw new Error('apiEndpoint not set')
  if (!namespace) throw new Error('namespace not set')
  const res = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pipe,
      namespace,
      date_from,
      date_to,
      limit,
    }),
  })
  if (!res.ok) {
    throw new Error(
      `Something went wrong: ${await res.status} ${await res.text()}`
    )
  }
  const json = await res.json()
  return json
}
