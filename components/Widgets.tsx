import dynamic, { LoaderComponent } from 'next/dynamic'
import InView from './InView'
import Widget from './Widget'
import { globalState } from '../lib/utils'
import AnalyticsProvider, { useAnalytics } from './Provider'
import DateFilter from './DateFilter'
import KPIsWidget from './KpisWidget'
import TopDevicesWidget from './TopDevicesWidget'
import TopLocationsWidget from './TopLocationsWidget'
import TopPagesWidget from './TopPagesWidget'
import TopSourcesWidget from './TopSourcesWidget'

enum WidgetHeight {
  XLarge = 588,
  Large = 442,
  Medium = 344,
  Small = 216,
}

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

        <div className="grid grid-cols-2 gap-6 sm:gap-10 ">
          <div className="col-span-2" style={{ minHeight: WidgetHeight.Large }}>
            <KPIsWidget />
          </div>
          <InView height={WidgetHeight.Large}>
            <TopPagesWidget />
          </InView>
          <InView height={WidgetHeight.Large}>
            <TopLocationsWidget />
          </InView>
          <InView height={WidgetHeight.Large}>
            <TopSourcesWidget />
          </InView>
          <InView height={WidgetHeight.Large}>
            <TopDevicesWidget />
          </InView>
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
