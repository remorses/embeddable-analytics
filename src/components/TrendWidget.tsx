import { BarChart } from '@tremor/react'
import Widget from './Widget'
import { useDateFilter, useQuery } from '../lib/hooks'
import { useMemo } from 'react'

import { Trend, TrendData } from '../lib/types'
import { getPipeFromClient } from '../lib/utils'
import { format } from 'date-fns'

export default function TrendWidget() {
  const { data, status, warning } = useTrend()
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        Date: format(new Date(d.t), 'HH:mm'),
        'Number of visits': d.visits,
      })),
    [data]
  )

  return (
    <Widget>
      <div className="flex items-center justify-between">
        <Widget.Title>Users in last 30 minutes</Widget.Title>
        <h3 className="text-neutral-64 font-normal text-xl">
          {data?.totalVisits ?? 0}
        </h3>
      </div>
      <Widget.Content
        status={status}
        loaderSize={40}
        noData={!chartData?.length}
        warning={warning?.message}
      >
        <BarChart
          data={chartData}
          index="Date"
          categories={['Number of visits']}
          colors={['blue']}
          className="h-32"
          showXAxis={false}
          showYAxis={false}
          showLegend={false}
          showGridLines={false}
        />
      </Widget.Content>
    </Widget>
  )
}

export async function getTrend({ date_from, date_to }): Promise<Trend> {
  const { data } = await getPipeFromClient<TrendData>('trend', {
    date_from,
    date_to,
  })
  const visits = data.map(({ visits }) => visits)
  const dates = data.map(({ t }) => {
    return format(new Date(t), 'HH:mm')
  })
  const totalVisits = visits.reduce((a, b) => a + b, 0)

  return {
    visits,
    dates,
    totalVisits,
    data,
  }
}

function useTrend() {
  const { date_from, date_to } = useDateFilter()
  return useQuery({ date_from, date_to, key: getTrend }, getTrend)
}
