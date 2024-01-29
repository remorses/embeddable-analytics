import dynamic, { LoaderComponent } from 'next/dynamic'
import InView from './InView'
import Widget from './Widget'
import { globalState } from '../lib/utils'
import AnalyticsProvider, { useAnalytics } from './Provider'
import DateFilter from './DateFilter'

const enum WidgetHeight {
  XLarge = 588,
  Large = 472,
  Medium = 344,
  Small = 216,
}

function lazyLoadWidget(
  importPromise: () => LoaderComponent,
  loaderSize?: number
) {
  return dynamic(importPromise, {
    loading: () => (
      <Widget>
        <Widget.Content status="loading" loaderSize={loaderSize} />
      </Widget>
    ),
    ssr: false,
  })
}

const KPIsWidget = lazyLoadWidget(() => import('./KpisWidget'), 80)
const BrowsersWidget = lazyLoadWidget(() => import('./BrowsersWidget'))
const TopPagesWidget = lazyLoadWidget(() => import('./TopPagesWidget'))
const TrendWidget = lazyLoadWidget(() => import('./TrendWidget'), 40)
const TopDevicesWidget = lazyLoadWidget(() => import('./TopDevicesWidget'))
const TopSourcesWidget = lazyLoadWidget(() => import('./TopSourcesWidget'))
const TopLocationsWidget = lazyLoadWidget(() => import('./TopLocationsWidget'))

export default function Widgets({
  domain,
  apiEndpoint = '/api/analytics',
  namespace,
}) {
  Object.assign(globalState, {
    apiEndpoint,
    namespace,
  })
  return (
    <AnalyticsProvider domain={domain}>
      <div className="space-y-6 sm:space-y-10">
        <Header />

        <div className="grid grid-cols-2 gap-5 sm:gap-10 grid-rows-3-auto">
          <div className="col-span-2" style={{ height: WidgetHeight.XLarge }}>
            <KPIsWidget />
          </div>
          <div className="col-start-1 col-span-2 lg:col-span-1 grid grid-cols-1 gap-5 sm:gap-10 grid-rows-3-auto">
            <InView height={WidgetHeight.Small}>
              <TrendWidget />
            </InView>
            <InView height={WidgetHeight.Large}>
              <TopPagesWidget />
            </InView>
            <InView height={WidgetHeight.Large}>
              <TopLocationsWidget />
            </InView>
          </div>
          <div className="col-start-1 col-span-2 lg:col-start-2 lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 sm:gap-10 grid-rows-2-auto lg:grid-rows-3-auto">
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <InView height={WidgetHeight.Large}>
                <TopSourcesWidget />
              </InView>
            </div>
            <InView height={WidgetHeight.Medium}>
              <TopDevicesWidget />
            </InView>
            <InView height={WidgetHeight.Medium}>
              <BrowsersWidget />
            </InView>
          </div>
        </div>
      </div>
    </AnalyticsProvider>
  )
}

export function Header() {
  const { domain } = useAnalytics()

  return (
    <header className="flex justify-between flex-col lg:flex-row gap-6">
      <div className="flex gap-2 md:gap-10 justify-between md:justify-start">
        <h1 className="flex items-center gap-2 min-w-max">
          <span className="text-lg leading-6">{domain}</span>
        </h1>
        <CurrentVisitors />
      </div>
      <DateFilter />
    </header>
  )
}

export function CurrentVisitors() {
  // const currentVisitors = useCurrentVisitors()
  const currentVisitors = 1
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full h-2 w-2 bg-success" />
      <p className="text-neutral-64 truncate">{`${currentVisitors} current visitor${
        currentVisitors === 1 ? '' : 's'
      }`}</p>
    </div>
  )
}
