/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Meta from '../components/Meta'
import Widgets from '../components/Widgets'

export default function DashboardPage() {
  const namespace = 'tinybird'
  const domain = 'tinybird.co'
  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <Script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-token={process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN}
        />
      )}
      <Meta />
      <div className="bg-body min-h-screen py-5 px-5 sm:px-10 text-sm leading-5 text-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-10">
            <img src="/icon.png" alt="" width={24} height={24} />

            <main>
              <Widgets domain={domain} namespace={namespace} />
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
