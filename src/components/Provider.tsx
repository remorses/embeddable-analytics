import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { SWRConfig } from 'swr'
import { QueryError } from '../lib/types'

type IAnalyticsContext = {
  error: QueryError | null
  setError: (error: QueryError | null) => void
  isDark: boolean
  domain: string
}

const AnalyticsContext = createContext<IAnalyticsContext>(
  {} as IAnalyticsContext
)

export default function AnalyticsProvider({
  children,
  value: { domain, isDark },
}) {
  const [error, setError] = useState<QueryError | null>(null)
  const value = { error, setError, domain, isDark }

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,

        refreshInterval: 120_000,
        dedupingInterval: 0,
        revalidateOnMount: true,
        onError: error => {
          if (error.status === 401 || error.status === 403) {
            setError(error)
          }
        },
      }}
    >
      <AnalyticsContext.Provider value={value}>
        {children}
      </AnalyticsContext.Provider>
    </SWRConfig>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context)
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  return context
}
