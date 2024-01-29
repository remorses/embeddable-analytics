import { Fragment } from 'react'
import Widget from './Widget'

import { browsers, formatNumber, getPipeFromClient } from '../lib/utils'
import { DonutChart } from '@tremor/react'
import { tremorPieChartColors } from '../styles/theme/tremor-colors'

import { useDateFilter, useQuery } from '../lib/hooks'
import { TopBrowsers, TopBrowsersData } from '../lib/types'

export default function BrowsersWidget() {
  const { date_from: from, date_to: to } = useDateFilter()

  const { data, status, warning } = useQuery(
    { date_from: from, date_to: to, key: 'topBrowsers' },
    getTopBrowsers
  )

  return (
    <Widget>
      <Widget.Title>Top Browsers</Widget.Title>
      <Widget.Content
        status={status}
        noData={!data?.data?.length}
        warning={warning?.message}
      >
        <div className="w-full h-full grid grid-cols-2">
          <DonutChart
            variant="pie"
            data={data?.data ?? []}
            category="visits"
            index="browser"
            colors={tremorPieChartColors.map(([color]) => color)}
            showLabel={false}
            valueFormatter={formatNumber}
          />
          <div className="justify-self-end">
            <div className="grid gap-y-1 gap-4 grid-cols-2">
              <div className="text-xs tracking-widest font-medium uppercase text-center truncate">
                Browser
              </div>
              <div className="text-xs tracking-widest font-medium uppercase text-right truncate">
                Visitors
              </div>
              {(data?.data ?? []).map(({ browser, visits }, index) => (
                <Fragment key={browser}>
                  <div className="flex items-center gap-2 text-sm leading-5 text-neutral-64 h-9 px-4 py-2 rounded-md z-10">
                    <div
                      className="h-4 min-w-[1rem]"
                      style={{
                        backgroundColor: tremorPieChartColors[index][1],
                      }}
                    />
                    <span>{browser}</span>
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

async function getTopBrowsers({ date_from, date_to }): Promise<TopBrowsers> {
  const { data: queryData } = await getPipeFromClient<TopBrowsersData>(
    'top_browsers',
    {
      date_from,
      date_to,
      limit: 4,
    }
  )
  const data = [...queryData]
    .sort((a, b) => b.visits - a.visits)
    .map(({ browser, visits }) => ({
      browser: browsers[browser] ?? browser,
      visits,
    }))

  return { data }
}
