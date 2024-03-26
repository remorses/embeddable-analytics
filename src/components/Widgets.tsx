import AnalyticsProvider, { useAnalytics } from './Provider'

import { globalState } from '../lib/utils'
import DateFilter from './DateFilter'
import GlobeWidget from './GlobeWidget'
import InView from './InView'
import KPIsWidget from './KpisWidget'
import TopDevicesWidget from './TopDevicesWidget'
import TopPagesWidget from './TopPagesWidget'
import TopSourcesWidget from './TopSourcesWidget'

const height = 440

export default function Widgets({ domain, isDark, apiEndpoint, namespace }) {
  Object.assign(globalState, {
    apiEndpoint,
    namespace,
  })
  return (
    <AnalyticsProvider value={{ domain, isDark }}>
      <div className="space-y-6 sm:space-y-10">
        <Header />

        <div className="grid grid-cols-2 gap-6 sm:gap-10 ">
          <div
            className="flex flex-col col-span-2"
            style={{ minHeight: height + 80 }}
          >
            <KPIsWidget />
          </div>
          <div
            className="flex flex-col col-span-2"
            style={{ minHeight: height }}
          >
            <GlobeWidget />
          </div>
          <InView height={height}>
            <TopPagesWidget />
          </InView>
          {/* <InView height={height}>
            <TopLocationsWidget />
          </InView> */}
          <InView height={height}>
            <TopSourcesWidget />
          </InView>
          <InView height={height}>
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
        {/* <h1 className="flex items-center gap-2 min-w-max">
          <span className="text-lg leading-6">{domain}</span>
        </h1>
        <CurrentVisitors /> */}
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
