import Widget from './Widget'
import KPIsTabs from './KpisTabs'
import { useDateFilter, useQuery } from '../lib/hooks'
import { BarChart } from '@tremor/react'
import { useMemo } from 'react'

import { useRouter } from 'next/router'

import {
  KpiTotals,
  KpisData,
  KpiType,
  QueryError,
  ChartValue,
  isKpi,
  KPI_OPTIONS,
} from '../lib/types'
import { getPipeFromClient } from '../lib/utils'
import { format } from 'date-fns'

export default function KPIsWidget() {
  const { data, kpi, setKpi, kpiOption, warning, status } = useKpis()

  const { date_from: from, date_to: to } = useDateFilter()
  const { data: kpiTotals, warning: warningTotals } = useQuery(
    { date_from: from, date_to: to, key: 'kpiTotals' },
    getKpiTotals
  )

  const chartData = useMemo(
    () =>
      (data?.dates ?? []).map((date, index) => {
        const value = Math.max(
          Number(data?.data[0][index]) || 0,
          Number(data?.data[1][index]) || 0
        )

        return {
          date: date.toUpperCase(),
          [kpiOption.label]: value,
        }
      }),
    [data?.data, data?.dates, kpiOption]
  )

  return (
    <Widget>
      <Widget.Title isVisuallyHidden>KPIs</Widget.Title>
      <KPIsTabs value={kpi} onChange={setKpi} totals={kpiTotals} />
      <Widget.Content
        status={status}
        noData={!chartData?.length}
        warning={warning?.message}
        className="pt-2 mt-4"
      >
        <BarChart
          data={chartData}
          index="date"
          categories={[kpiOption.label]}
          colors={['blue']}
          valueFormatter={kpiOption.formatter}
          showLegend={false}
        />
      </Widget.Content>
    </Widget>
  )
}

async function getKpiTotals({ date_from, date_to }): Promise<KpiTotals> {
  console.log('getKpiTotals', date_from, date_to)
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

  const { data } = await getPipeFromClient<KpisData>('kpis', {
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

const arrayHasCurrentDate = (dates: string[], isHourlyGranularity: boolean) => {
  const now = format(new Date(), isHourlyGranularity ? 'HH:00' : 'MMM dd, yyyy')
  return dates[dates.length - 1] === now
}

async function getKpis({
  kpi,
  date_from,
  date_to,
}: {
  kpi: KpiType
  date_from: string
  date_to: string
}) {
  const { data: queryData } = await getPipeFromClient<KpisData>('kpis', {
    date_from,
    date_to,
  })
  const isHourlyGranularity = !!date_from && !!date_to && date_from === date_to
  const dates = queryData.map(({ date }) =>
    format(new Date(date), isHourlyGranularity ? 'HH:00' : 'MMM dd, yyyy')
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

function useKpis() {
  const { date_from, date_to } = useDateFilter()
  const router = useRouter()
  const { kpi: kpiParam } = router.query
  const kpi = isKpi(kpiParam) ? kpiParam : 'visits'
  const kpiOption = KPI_OPTIONS.find(({ value }) => value === kpi)!
  const query = useQuery({ kpi, date_from, date_to, key: 'kpis' }, getKpis)

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
