import { BarList } from '@tremor/react'
import { useMemo } from 'react'
import { useDateFilter, useParams, useQuery } from '../lib/hooks'
import {
  TopLocation,
  TopLocationsData,
  TopLocationsSorting,
} from '../lib/types'
import { cx, getPipeFromClient } from '../lib/utils'
import Widget from './Widget'

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

async function getTopLocations({
  date_from,
  date_to,
  sorting,
}: {
  sorting: TopLocationsSorting
  date_from?: string
  date_to?: string
}) {
  const { data: queryData } = await getPipeFromClient<TopLocationsData>(
    'top_locations',
    { limit: 8, date_from, date_to }
  )
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

  const data: TopLocation[] = [...queryData]
    .sort((a, b) => b[sorting] - a[sorting])
    .map(({ location, ...rest }) => {
      const unknownLocation = '🌎  Unknown'
      return {
        location: location
          ? `${getFlagEmoji(location)} ${regionNames.of(location)}`
          : unknownLocation,
        shortLocation: location
          ? `${getFlagEmoji(location)} ${location}`
          : unknownLocation,
        ...rest,
      }
    })

  const locations = data.map(({ location }) => location)
  const labels = data.map(record => record[sorting])

  return {
    data,
    locations,
    labels,
  }
}

function useTopLocations() {
  const { date_from, date_to } = useDateFilter()
  const [sorting] = useParams({
    key: 'top_locations_sorting',
    defaultValue: TopLocationsSorting.Visitors,
    values: Object.values(TopLocationsSorting),
  })
  return useQuery(
    { sorting, date_from, date_to, key: 'topLocations' },
    getTopLocations
  )
}

export default function TopLocationsWidget() {
  const { data, status, warning } = useTopLocations()
  const [sorting, setSorting] = useParams({
    key: 'top_locations_sorting',
    values: Object.values(TopLocationsSorting),
  })
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.location,
        value: d[sorting],
      })),
    [data?.data, sorting]
  )

  return (
    <Widget>
      <Widget.Title>Top Countries</Widget.Title>
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
              'col-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopLocationsSorting.Visitors && 'text-primary'
            )}
            onClick={() => setSorting(TopLocationsSorting.Visitors)}
          >
            Visits
          </div>
          <div
            className={cx(
              'col-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopLocationsSorting.Pageviews && 'text-primary'
            )}
            onClick={() => setSorting(TopLocationsSorting.Pageviews)}
          >
            Pageviews
          </div>

          <div className="col-span-3">
            <BarList data={chartData} valueFormatter={(_: any) => ''} />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ location, visits }) => (
              <div
                key={location}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {visits}
              </div>
            ))}
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ location, hits }) => (
              <div
                key={location}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {hits}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
