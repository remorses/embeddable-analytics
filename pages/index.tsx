/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Credentials from '../components/Credentials'
import ErrorModal from '../components/ErrorModal'
import Header from '../components/Header'
import Meta from '../components/Meta'
import Widgets from '../components/Widgets'
import { useAuth } from '../lib/hooks'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()

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
            {isAuthenticated && isTokenValid && (
              <>
                <img src="/icon.png" alt="" width={24} height={24} />
                <Header />
              </>
            )}
            <main>
              {isAuthenticated && !isTokenValid && <ErrorModal />}
              {isAuthenticated && isTokenValid && <Widgets />}
              {!isAuthenticated && <Credentials />}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
