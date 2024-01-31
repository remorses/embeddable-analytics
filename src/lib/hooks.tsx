import { DateFilter, QueryError, QueryResponse, dateFormat } from './types'
import { format, subDays } from 'date-fns'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import useSWR, { Fetcher, Key } from 'swr'

import { DateRangePickerValue } from '@tremor/react'
import { useRouter } from 'next/router'

export function useDateFilter() {
  const router = useRouter()
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>()

  const setDateFilter = ({ from, to, selectValue }: DateRangePickerValue) => {
    const lastDays = selectValue ?? DateFilter.Custom

    const searchParams = new URLSearchParams(window.location.search)
    let last_days = lastDays
    let start_date = router.query.start_date
    let end_date = router.query.end_date
    if (lastDays === DateFilter.Custom && from && to) {
      start_date = format(from, dateFormat)
      end_date = format(to, dateFormat)
    } else {
      start_date = undefined
      end_date = undefined
      searchParams.delete('end_date')
    }
    router.push(
      {
        query: {
          ...router.query,
          start_date,
          end_date,
          last_days,
        },
      },
      undefined,
      { scroll: false }
    )
  }

  const lastDaysParam = router.query.last_days as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
    Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  const { from: date_from, to: date_to } = useMemo(() => {
    const today = new Date()

    if (lastDays === DateFilter.Custom) {
      const fromParam = router.query.start_date as string
      const toParam = router.query.end_date as string

      const from = fromParam || format(subDays(today, 7), dateFormat)

      const to = toParam || format(today, dateFormat)

      return { from, to }
    }

    const from = format(subDays(today, Number(lastDays)), dateFormat)
    const to =
      lastDays === DateFilter.Yesterday
        ? format(subDays(today, 1), dateFormat)
        : format(today, dateFormat)

    return { from, to }
  }, [lastDays, router.query.start_date, router.query.end_date])

  useEffect(() => {
    const from = new Date(date_from)
    const to = new Date(date_to)
    // console.log({ from, to, date_from, date_to })
    setDateRangePickerValue({
      from,
      to,
      selectValue: lastDays === DateFilter.Custom ? undefined : lastDays,
    })
  }, [date_from, date_to, lastDays])

  const onDateRangePickerValueChange = useCallback(
    ({ from, to, selectValue }: DateRangePickerValue) => {
      if (from && to) {
        setDateFilter({ from, to, selectValue })
      } else {
        setDateRangePickerValue({ from, to, selectValue })
      }
    },
    [setDateFilter]
  )

  // console.log({
  //   date_from,
  //   date_to,
  // })
  return {
    date_from: date_from,
    date_to: date_to,
    dateRangePickerValue,
    onDateRangePickerValueChange,
  }
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!delay && delay !== 0) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export { useIsomorphicLayoutEffect }

export function useQuery<T, K extends Key>(
  key: K,
  fetcher: Fetcher<T, K>,
  config?: {
    onSuccess?: (data: T) => void
    onError?: (error: QueryError) => void
  }
): QueryResponse<T> {
  const [warning, setWarning] = useState<QueryError | null>(null)

  const handleError = (error: QueryError) => {
    config?.onError?.(error)
    console.error('useQuery error', error)
    if (error.status !== 404 && error.status !== 400) return
    setWarning(error)
  }

  const handleSuccess = (data: T) => {
    config?.onSuccess?.(data)
    setWarning(null)
  }

  const query = useSWR(key, fetcher, {
    onError: handleError,
    onSuccess: handleSuccess,
  })

  const { data, error, isValidating } = query

  const getStatus = () => {
    if (!data && !error) return 'loading'
    if (isValidating) return 'updating'
    if (error) return 'error'
    if (!!data) return 'success'
    return 'idle'
  }

  return { ...query, warning, status: getStatus() }
}
