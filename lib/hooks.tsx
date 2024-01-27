import { DateRangePickerValue } from '@tremor/react'
import moment from 'moment'
import { useRouter } from 'next/router'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import useSWR, { Fetcher, Key } from 'swr'
import { useAnalytics } from '../components/Provider'
import { queryPipe, querySQL } from './api'
import {
  ChartValue,
  DateFilter,
  DomainData,
  DomainQueryData,
  KPI_OPTIONS,
  KpiTotals,
  KpiType,
  KpisData,
  QueryError,
  QueryResponse,
  TopBrowsers,
  TopBrowsersData,
  TopDevices,
  TopDevicesData,
  TopPagesData,
  TopPagesSorting,
  TopSource,
  TopSources,
  Trend,
  TrendData,
  dateFormat,
  isKpi,
} from './types'
import { browsers, devices } from './utils'

export function useAuth() {
  const router = useRouter()
  const { token: tokenParam, host: hostParam } = router.query
  const token = typeof tokenParam === 'string' ? tokenParam : null
  const host = typeof hostParam === 'string' ? hostParam : null
  const { error } = useAnalytics()
  const isTokenValid = !error || ![401, 403].includes(error.status ?? 0)
  const isAuthenticated = !!token && !!host
  return { isAuthenticated, token, host, isTokenValid }
}

export function useDateFilter() {
  const router = useRouter()
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>()

  const setDateFilter = useCallback(
    ({ from, to, selectValue }: DateRangePickerValue) => {
      const lastDays = selectValue ?? DateFilter.Custom

      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('last_days', lastDays)

      if (lastDays === DateFilter.Custom && from && to) {
        searchParams.set('start_date', moment(from).format(dateFormat))
        searchParams.set('end_date', moment(to).format(dateFormat))
      } else {
        searchParams.delete('start_date')
        searchParams.delete('end_date')
      }
      router.push(
        {
          query: searchParams.toString(),
        },
        undefined,
        { scroll: false }
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const lastDaysParam = router.query.last_days as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
    Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  const { from, to } = useMemo(() => {
    const today = moment().utc()
    if (lastDays === DateFilter.Custom) {
      const fromParam = router.query.start_date as string
      const toParam = router.query.end_date as string

      const from =
        fromParam ||
        moment(today).subtract(+DateFilter.Last7Days, 'days').format(dateFormat)
      const to = toParam || moment(today).format(dateFormat)

      return { from, to }
    }

    const from = moment(today).subtract(+lastDays, 'days').format(dateFormat)
    const to =
      lastDays === DateFilter.Yesterday
        ? moment(today)
            .subtract(+DateFilter.Yesterday, 'days')
            .format(dateFormat)
        : moment(today).format(dateFormat)

    return { from, to }
  }, [lastDays, router.query.start_date, router.query.end_date])

  useEffect(() => {
    setDateRangePickerValue({
      from: moment(from).toDate(),
      to: moment(to).toDate(),
      selectValue: lastDays === DateFilter.Custom ? undefined : lastDays,
    })
  }, [from, to, lastDays])

  const onDateRangePickerValueChange = useCallback(
    ({ from, to, selectValue }: DateRangePickerValue) => {
      if (from && to) {
        setDateFilter({ from, to, selectValue })
      } else {
        setDateRangePickerValue({ from, to, selectValue })
      }
    },
    [setDateFilter]
  )

  return {
    from,
    to,
    dateRangePickerValue,
    onDateRangePickerValueChange,
  }
}

async function getDomain(): Promise<DomainData> {
  // Guess the instrumented domain, and exclude other domains like development or staging.
  //  - Try to get the domain with most hits from the last hour.
  //  - Fallback to 'some' domain.
  // Best balance between data accuracy and performance I can get.
  const { data } = await querySQL<DomainQueryData>(`
    with (
      SELECT nullif(domainWithoutWWW(href),'') as domain
      FROM analytics_hits
      where timestamp >= now() - interval 1 hour
      group by domain
      order by count(1) desc
      limit 1
    ) as top_domain,
    (
      SELECT domainWithoutWWW(href)
      FROM analytics_hits
      where href not like '%localhost%'
      limit 1
    ) as some_domain
    select coalesce(top_domain, some_domain) as domain format JSON
  `)
  const domain = data[0]['domain']
  const logo = domain ? `https://${domain}/favicon.ico` : FALLBACK_LOGO

  return {
    domain,
    logo,
  }
}

const FALLBACK_LOGO = '/fallback-logo.png'

export function useDomain() {
  const [logo, setLogo] = useState(FALLBACK_LOGO)

  const { data } = useSWR('domain', getDomain, {
    onSuccess: ({ logo }) => setLogo(logo),
  })

  const handleLogoError = () => {
    setLogo(FALLBACK_LOGO)
  }

  return {
    domain: data?.domain ?? 'domain.com',
    logo,
    handleLogoError,
  }
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!delay && delay !== 0) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export { useIsomorphicLayoutEffect }

async function getKpiTotals(
  date_from?: string,
  date_to?: string
): Promise<KpiTotals> {
  /**
   * If we sent the same value for date_from and date_to, the result is one row per hour.
   *
   * But we actually need one row per date, so we're sending one extra day in the filter,
   * and removing ir afterwards.
   *
   * Not the best approach, it'd be better to modify the kpis endpoint. But we don't want
   * to break the backwards compatibility (breaking the dashboard for alreayd active users).
   *
   */
  let date_to_aux = date_to ? new Date(date_to) : new Date()
  date_to_aux.setDate(date_to_aux.getDate() + 1)
  const date_to_aux_str = date_to_aux.toISOString().substring(0, 10)

  const { data } = await queryPipe<KpisData>('kpis', {
    date_from,
    date_to: date_to_aux_str,
  })

  const queryData = data.filter(record => record['date'] != date_to_aux_str)

  // Sum total KPI value from the trend
  const _KPITotal = (kpi: KpiType) =>
    queryData.reduce((prev, curr) => (curr[kpi] ?? 0) + prev, 0)

  // Get total number of sessions
  const totalVisits = _KPITotal('visits')

  // Sum total KPI value from the trend, ponderating using sessions
  const _ponderatedKPIsTotal = (kpi: KpiType) =>
    queryData.reduce(
      (prev, curr) => prev + ((curr[kpi] ?? 0) * curr['visits']) / totalVisits,
      0
    )

  return {
    avg_session_sec: _ponderatedKPIsTotal('avg_session_sec'),
    pageviews: _KPITotal('pageviews'),
    visits: totalVisits,
    bounce_rate: _ponderatedKPIsTotal('bounce_rate'),
  }
}

function getNotFoundColumnsWarning(warning: QueryError | null): string | null {
  if (!warning) return null
  try {
    // parsing the error message to get the columns that are not found
    const rawColumns = warning.message
      .split('required columns:')[1]
      .trim()
      .split("'")
      .map(part => part.trim())
      .filter(Boolean)
      .join()
      .split(',')
      .slice(0, -1)
    const columns = Array.from(new Set(rawColumns))
    const formatter = new Intl.ListFormat('en', {
      style: 'long',
      type: 'conjunction',
    })
    return `${formatter.format(columns)} column${
      columns.length ? 's' : ''
    } at the analytics_events data source cannot be found`
  } catch (error) {
    return null
  }
}

export function useKpiTotals() {
  const { from, to } = useDateFilter()
  const { warning, ...query } = useQuery([from, to, 'kpiTotals'], getKpiTotals)
  return { ...query, warning: getNotFoundColumnsWarning(warning) }
}

const arrayHasCurrentDate = (dates: string[], isHourlyGranularity: boolean) => {
  const now = moment()
    .utc()
    .format(isHourlyGranularity ? 'HH:00' : 'MMM DD, YYYY')
  return dates[dates.length - 1] === now
}

async function getKpis(kpi: KpiType, date_from?: string, date_to?: string) {
  const { data: queryData } = await queryPipe<KpisData>('kpis', {
    date_from,
    date_to,
  })
  const isHourlyGranularity = !!date_from && !!date_to && date_from === date_to
  const dates = queryData.map(({ date }) =>
    moment(date).format(isHourlyGranularity ? 'HH:mm' : 'MMM DD, YYYY')
  )
  const isCurrentData = arrayHasCurrentDate(dates, isHourlyGranularity)

  const data = isCurrentData
    ? queryData.reduce(
        (acc, record, index) => {
          const value = record[kpi] ?? 0

          const pastValue = index < queryData.length - 1 ? value : ''
          const currentValue = index > queryData.length - 3 ? value : ''

          const [pastPart, currentPart] = acc

          return [
            [...pastPart, pastValue],
            [...currentPart, currentValue],
          ]
        },
        [[], []] as ChartValue[][]
      )
    : [queryData.map(value => value[kpi] ?? 0), ['']]

  return {
    dates,
    data,
  }
}

export function useKpis() {
  const { from, to } = useDateFilter()
  const router = useRouter()
  const { kpi: kpiParam } = router.query
  const kpi = isKpi(kpiParam) ? kpiParam : 'visits'
  const kpiOption = KPI_OPTIONS.find(({ value }) => value === kpi)!
  const query = useQuery([kpi, from, to, 'kpis'], getKpis)

  const setKpi = (kpi: KpiType) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('kpi', kpi)
    router.push(
      {
        query: searchParams.toString(),
      },
      undefined,
      { scroll: false }
    )
  }

  return {
    setKpi,
    kpi,
    kpiOption,
    ...query,
  }
}

export function useParams<T extends string>({
  key,
  defaultValue,
  values,
}: {
  key: string
  defaultValue?: T
  values: T[]
}): [T, (param: T) => void] {
  const router = useRouter()
  const param = router.query[key] as T
  const value =
    typeof param === 'string' && values.includes(param)
      ? param
      : defaultValue ?? values[0]

  const setParam = (param: T) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(key, param)
    router.push(
      {
        query: searchParams.toString(),
      },
      undefined,
      { scroll: false }
    )
  }

  return [value, setParam]
}

export function useQuery<T, K extends Key>(
  key: K,
  fetcher: Fetcher<T, K>,
  config?: {
    onSuccess?: (data: T) => void
    onError?: (error: QueryError) => void
  }
): QueryResponse<T> {
  const [warning, setWarning] = useState<QueryError | null>(null)

  const handleError = (error: QueryError) => {
    config?.onError?.(error)
    if (error.status !== 404 && error.status !== 400) return
    setWarning(error)
  }

  const handleSuccess = (data: T) => {
    config?.onSuccess?.(data)
    setWarning(null)
  }

  const query = useSWR(key, fetcher, {
    onError: handleError,
    onSuccess: handleSuccess,
  })

  const { data, error, isValidating } = query

  const getStatus = () => {
    if (!data && !error) return 'loading'
    if (isValidating) return 'updating'
    if (error) return 'error'
    if (!!data) return 'success'
    return 'idle'
  }

  return { ...query, warning, status: getStatus() }
}



import { TopLocation, TopLocationsData, TopLocationsSorting } from './types'

