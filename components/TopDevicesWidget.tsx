import { DonutChart } from '@tremor/react'
import { Fragment } from 'react'

import {
  browsers,
  devices,
  formatNumber,
  getPipeFromClient,
} from '../lib/utils'
import { tremorPieChartColors } from '../styles/theme/tremor-colors'
import Widget from './Widget'

import { useDateFilter, useQuery } from '../lib/hooks'
import {
  TopBrowsers,
  TopBrowsersData,
  TopDevices,
  TopDevicesData,
} from '../lib/types'

async function getTopDevices(
  date_from?: string,
  date_to?: string
): Promise<TopDevices> {
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
  const { from, to } = useDateFilter()
  return useQuery([from, to, 'topDevices'], getTopDevices)
}

export default function TopDevicesWidget() {
  const { data, warning, status } = useTopDevices()
  
  return (
    <Widget>
      <Widget.Title>Top Devices</Widget.Title>
      <Widget.Content
        status={status}
        noData={!data?.data?.length}
        warning={warning?.message}
      >
        <div className="w-full h-full grid grid-cols-2">
          <DonutChart
            data={data?.data ?? []}
            category="visits"
            index="device"
            colors={tremorPieChartColors.map(([color]) => color)}
            showLabel={false}
            valueFormatter={formatNumber}
          />
          <div className="justify-self-end">
            <div className="grid grid-cols-2 gap-y-1 gap-4">
              <div className="text-xs tracking-widest font-medium uppercase text-center truncate">
                Device
              </div>
              <div className="text-xs tracking-widest font-medium uppercase text-right truncate">
                Visitors
              </div>
              {(data?.data ?? []).map(({ device, visits }, index) => (
                <Fragment key={device}>
                  <div className="flex items-center gap-2 text-sm leading-5 text-neutral-64 h-9 px-4 py-2 rounded-md z-10">
                    <div
                      className="h-4 min-w-[1rem]"
                      style={{
                        backgroundColor: tremorPieChartColors[index][1],
                      }}
                    />
                    <span>{device}</span>
                  </div>
                  <div className="flex items-center justify-end text-neutral-64 h-9">
                    {formatNumber(visits)}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
