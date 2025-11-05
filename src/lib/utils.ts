import { QueryPipe } from './types'

export const globalState = {
  namespace: '',
  apiEndpoint: '',
}

import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cx = (...args: ClassValue[]) => {
  return twMerge(clsx(...args))
}

// Tremor focusInput [v0.0.2]
export const focusInput = [
  'focus:ring-2',
  'focus:ring-blue-200 dark:focus:ring-blue-700/30',
  'focus:border-blue-500 dark:focus:border-blue-700',
]

// Tremor Raw focusRing [v0.0.1]
export const focusRing = [
  'outline outline-offset-2 outline-0 focus-visible:outline-2',
  'outline-blue-500 dark:outline-blue-500',
]

// Tremor Raw hasErrorInput [v0.0.1]
export const hasErrorInput = [
  'ring-2',
  'border-red-500 dark:border-red-700',
  'ring-red-200 dark:ring-red-700/30',
]

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
  {
    date_from,
    date_to,
    limit = undefined,
  }: {
    date_from?: string
    date_to?: string
    limit?: number
  }
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

export function formatDateTimeForClickHouse(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // JavaScript months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
