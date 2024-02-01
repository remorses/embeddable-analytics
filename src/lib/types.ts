import {
  formatMinSec,
  formatNumber,
  formatPercentage,
  kFormatter,
} from './utils'

import { Color } from '@tremor/react'
import { SWRResponse } from 'swr'

export type ClientResponse<T> = T & { error?: string }

export type BaseColumnType = 'String' | 'Date' | 'UInt64' | 'Float64'

export type ColumnType = BaseColumnType | `Nullable(${BaseColumnType})`

export type Meta<T> = { name: keyof T; type: ColumnType }

export type Statistics = {
  elapsed: number
  rows_read: number
  bytes_read: number
}

export type QueryPipe<T> = {
  meta: Meta<T>[]
  data: T[]
  rows: number
  statistics: Statistics
}

export type QuerySQL<T> = {
  meta: Meta<T>[]
  data: T[]
  rows: number
  statistics: Statistics
}

export type PipeParams<T> = Record<keyof T, string> & {
  limit: number
  date_to: string
  date_from: string
}

export type QueryStatus = 'idle' | 'loading' | 'updating' | 'error' | 'success'

export class QueryError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'QueryError'
    this.status = status
  }
}

export type QueryResponse<T> = SWRResponse<T> & {
  warning: QueryError | null
  status: QueryStatus
}

export type ChartValue = number | string

export enum HostType {
  Eu = 'https://ui.tinybird.co',
  Us = 'https://ui.us-east.tinybird.co',
  Other = 'other',
}

export enum DateFilter {
  Today = '0',
  Yesterday = '1',
  Last7Days = '7',
  Last30Days = '30',
  Last12Months = '365',
  Custom = 'custom',
}

export type DateRangePickerOption = {
  value: string
  text: string
  startDate: Date
}

export const dateFormat = 'yyyy-MM-dd'

export type DomainQueryData = { domain: string }

export type DomainData = {
  domain: string | null
  logo: string
}

export type KpisData = {
  date: string
  visits: number
  pageviews: number
  bounce_rate: null | number
  avg_session_sec: number
}

export const ALL_KPIS = [
  'visits',
  'pageviews',
  'avg_session_sec',
  'bounce_rate',
] as const

type KpiTuple = typeof ALL_KPIS

export type KpiType = KpiTuple[number]

export function isKpi(kpi: string | string[] | undefined): kpi is KpiType {
  return ALL_KPIS.includes(kpi as KpiType)
}

export type KpiTotals = Record<KpiType, number>

export type KpiOption = {
  label: string
  value: KpiType
  tooltip: string
  formatter: (value: number) => string
}

export const KPI_OPTIONS: KpiOption[] = [
  {
    label: 'unique visitors',
    value: 'visits',
    tooltip: 'visits',
    formatter: formatNumber,
  },
  {
    label: 'site pageviews',
    value: 'pageviews',
    tooltip: 'pageviews',
    formatter: kFormatter,
  },
  {
    label: 'avg. visit time',
    value: 'avg_session_sec',
    tooltip: 'avg. visit time',
    formatter: formatMinSec,
  },
  {
    label: 'bounce rate',
    value: 'bounce_rate',
    tooltip: 'bounce rate',
    formatter: formatPercentage,
  },
]

export interface OptionType<T> {
  text: string
  value: T
}

export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'opera' | 'ie'

export type TopBrowsersData = {
  browser: BrowserType
  visits: number
  hits: number
}

export type TopBrowser = {
  browser: string
  visits: number
}

export type TopBrowsers = {
  data: TopBrowser[]
}

export type DeviceType = 'desktop' | 'mobile-ios' | 'mobile-android' | 'bot'

export type TopDevicesData = {
  device: DeviceType
  browser: string
  visits: number
  hits: number
}

export type TopDevice = {
  device: string
  visits: number
}

export type TopDevices = {
  data: TopDevice[]
}

export type TopLocationsData = {
  location: string
  visits: number
  hits: number
}

export enum TopLocationsSorting {
  Visitors = 'visits',
  Pageviews = 'hits',
}

export type TopLocation = {
  location: string
  shortLocation: string
  visits: number
  hits: number
}

export type TopPagesData = {
  pathname: string
  visits: number
  hits: number
}

export enum TopPagesSorting {
  Visitors = 'visits',
  Pageviews = 'hits',
}

export type TopSource = {
  referrer: string
  visits: number
  href?: string
}

export type TopSources = {
  data: TopSource[]
  refs: string[]
  visits: number[]
}

export type TrendData = {
  t: string
  visits: number
}

export type Trend = {
  visits: number[]
  dates: string[]
  totalVisits: number
  data: TrendData[]
}
