import { BarList } from '@tremor/react'
import { useMemo } from 'react'
import { useDateFilter, useDomain, useParams, useQuery } from '../lib/hooks'
import { TopPagesData, TopPagesSorting } from '../lib/types'
import { cx, formatNumber } from '../lib/utils'
import Widget from './Widget'
import { queryPipe } from '../lib/api'

export default function TopPagesWidget() {
  const { data, status, warning } = useTopPages()
  const { domain } = useDomain()
  const [sorting, setSorting] = useParams({
    key: 'top_pages_sorting',
    values: Object.values(TopPagesSorting),
  })
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.pathname,
        value: d[sorting],
        href: `https://${domain}${d.pathname}`,
      })),
    [data?.data, domain, sorting]
  )

  return (
    <Widget>
      <Widget.Title>Top Pages</Widget.Title>
      <Widget.Content
        status={status}
        noData={!chartData?.length}
        warning={warning?.message}
      >
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-3 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Content
          </div>
          <div
            className={cx(
              'col-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopPagesSorting.Visitors && 'text-primary'
            )}
            onClick={() => setSorting(TopPagesSorting.Visitors)}
          >
            Visits
          </div>
          <div
            className={cx(
              'col-span-1 row-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopPagesSorting.Pageviews && 'text-primary'
            )}
            onClick={() => setSorting(TopPagesSorting.Pageviews)}
          >
            Pageviews
          </div>

          <div className="col-span-3">
            <BarList data={chartData} valueFormatter={(_: any) => ''} />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ pathname, visits }) => (
              <div
                key={pathname}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {formatNumber(visits ?? 0)}
              </div>
            ))}
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ pathname, hits }) => (
              <div
                key={pathname}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {formatNumber(hits)}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}

async function getTopPages(
  sorting: TopPagesSorting,
  date_from?: string,
  date_to?: string
) {
  const { data: queryData, meta } = await queryPipe<TopPagesData>('top_pages', {
    limit: 8,
    date_from,
    date_to,
  })
  const data = [...queryData].sort((a, b) => b[sorting] - a[sorting])

  const columnLabels = {
    pathname: 'content',
    visits: 'visitors',
    hits: 'pageviews',
  }
  const columns = meta.map(({ name }) => ({
    label: columnLabels[name],
    value: name,
  }))
  const pages = data.map(({ pathname }) => pathname)
  const labels = data.map(record => record[sorting])

  return {
    data,
    columns,
    pages,
    labels,
  }
}

function useTopPages() {
  const { from, to } = useDateFilter()
  const [sorting] = useParams({
    key: 'top_pages_sorting',
    defaultValue: TopPagesSorting.Visitors,
    values: Object.values(TopPagesSorting),
  })
  return useQuery([sorting, from, to, 'topPages'], getTopPages)
}
