/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Meta from '../components/Meta'
import Widgets from '../components/Widgets'
import { track } from '../tracker'
import { useEffect } from 'react'

const token =
  'p.eyJ1IjogIjJlNDUyMzlmLTliZDItNGE5YS1iMDkwLTJmNjMyY2EwODJkZiIsICJpZCI6ICJmNTI0NTliMi1hOGZiLTQ4ZTEtODNiYi1kMzMyMjgwM2JjMjEiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.NZPo51CYeFx7PLLEnGK6vIfN4z1SMnED4oyosvbRiMg'
export default function DashboardPage() {
  const namespace = 'x'
  const domain = 'tinybird.co'

  useEffect(() => {
    track({ namespace, token })
  }, [])
  return (
    <>
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
