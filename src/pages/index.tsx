import { useEffect, useState } from 'react'

import Meta from '../components/Meta'
/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Widgets from '../components/Widgets'
import { init } from '../track'

const token =
  'p.eyJ1IjogIjJlNDUyMzlmLTliZDItNGE5YS1iMDkwLTJmNjMyY2EwODJkZiIsICJpZCI6ICJmNTI0NTliMi1hOGZiLTQ4ZTEtODNiYi1kMzMyMjgwM2JjMjEiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.NZPo51CYeFx7PLLEnGK6vIfN4z1SMnED4oyosvbRiMg'
const namespace = 'x'
init({ token, namespace })

export default function DashboardPage() {
  const domain = 'tinybird.co'
  const [isDark, setDark] = useState(true)

  return (
    <div className={isDark ? 'dark' : ''}>
      <Meta />

      <div className=" dark:bg-gray-900 min-h-screen py-5 px-5 sm:px-10 text-sm leading-5 text-secondary dark:text-gray-200 ">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 sm:space-y-10">
            <div className="flex ">
              <div className="grow"></div>
              <div className="">
                <button onClick={() => setDark(x => !x)} className="">
                  {isDark ? 'light' : 'dark'}
                </button>
              </div>
            </div>

            <main>
              <Widgets
                apiEndpoint="/api/analytics-data"
                domain={'x'}
                isDark={isDark}
                namespace={namespace}
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
