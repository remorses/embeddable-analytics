import { BarList } from '@tremor/react'
import Widget from './Widget'
import { useDateFilter, useQuery } from '../lib/hooks'
import { formatNumber, getPipeFromClient } from '../lib/utils'
import { useMemo } from 'react'

import { TopSources, TopSource } from '../lib/types'

export default function TopSourcesWidget() {
  const { data, status, warning } = useTopSources()
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.referrer,
        value: d.visits,
        href: d.href,
      })),
    [data?.data]
  )

  return (
    <Widget>
      <Widget.Title>Top Sources</Widget.Title>
      <Widget.Content
        status={status}
        noData={!chartData?.length}
        warning={warning?.message}
      >
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-4 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Refs
          </div>
          <div className="col-span-1 font-semibold text-xs text-right tracking-widest uppercase h-5">
            Visitors
          </div>

          <div className="col-span-4">
            <BarList data={chartData} valueFormatter={(_: any) => ''} />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ referrer, visits }) => (
              <div
                key={referrer}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {formatNumber(visits ?? 0)}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}

async function getTopSources({ date_from, date_to }): Promise<TopSources> {
  const { data: queryData } = await getPipeFromClient<TopSource>(
    'top_sources',
    {
      limit: 8,
      date_from,
      date_to,
    }
  )

  const data: TopSource[] = [...queryData]
    .sort((a, b) => b.visits - a.visits)
    .map(({ referrer, visits }) => ({
      referrer: referrer || 'Direct',
      href: referrer ? `https://${referrer}` : undefined,
      visits,
    }))
  const refs = data.map(({ referrer }) => referrer)
  const visits = data.map(({ visits }) => visits)

  return {
    data,
    refs,
    visits,
  }
}

function useTopSources() {
  const { date_from, date_to } = useDateFilter()
  return useQuery({ date_from, date_to, key: 'topSources' }, getTopSources)
}
