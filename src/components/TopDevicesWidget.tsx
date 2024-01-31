import { BarList, DonutChart } from '@tremor/react'
import { Fragment, useMemo } from 'react'

import { cx, devices, formatNumber, getPipeFromClient } from '../lib/utils'
import { tremorPieChartColors } from '../styles/theme/tremor-colors'
import Widget from './Widget'

import { useDateFilter, useQuery } from '../lib/hooks'
import { TopDevices, TopDevicesData, TopLocationsSorting } from '../lib/types'

export default function TopDevicesWidget() {
  const { data, warning, status } = useTopDevices()
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.device,
        value: d.visits,
      })),
    [data?.data]
  )
  return (
    <Widget>
      <Widget.Title>Top Devices</Widget.Title>
      <Widget.Content
        status={status}
        noData={!data?.data?.length}
        warning={warning?.message}
      >
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-3 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Country
          </div>
          <div
            className={cx(
              'col-span-2 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5'
            )}
          >
            Visitors
          </div>

          <div className="col-span-3">
            <BarList data={chartData} valueFormatter={(_: any) => ''} />
          </div>
          <div className="flex flex-col col-span-2 row-span-4 gap-2">
            {(data?.data ?? []).map(({ device, visits }) => (
              <div
                key={device}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {visits}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}

async function getTopDevices({
  date_from,
  date_to,
}: {
  date_from?: string
  date_to?: string
}): Promise<TopDevices> {
  const { data: queryData } = await getPipeFromClient<TopDevicesData>(
    'top_devices',
    {
      date_from,
      date_to,
      limit: 4,
    }
  )
  const data = [...queryData]
    .sort((a, b) => b.visits - a.visits)
    .map(({ device, visits }) => ({
      device: devices[device] ?? device,
      visits,
    }))

  return { data }
}

export function useTopDevices() {
  const { date_from: date_from, date_to: date_to } = useDateFilter()
  return useQuery({ date_from, date_to, key: 'topDevices' }, getTopDevices)
}
