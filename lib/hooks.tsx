import { DateRangePickerValue } from '@tremor/react'
import moment from 'moment'
import { useRouter } from 'next/router'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import useSWR, { Fetcher, Key } from 'swr'
import { DateFilter, QueryError, QueryResponse, dateFormat } from './types'

export function useDateFilter() {
  const router = useRouter()
  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>()

  const setDateFilter = useCallback(
    ({ from, to, selectValue }: DateRangePickerValue) => {
      const lastDays = selectValue ?? DateFilter.Custom

      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('last_days', lastDays)

      if (lastDays === DateFilter.Custom && from && to) {
        searchParams.set('start_date', moment(from).format(dateFormat))
        searchParams.set('end_date', moment(to).format(dateFormat))
      } else {
        searchParams.delete('start_date')
        searchParams.delete('end_date')
      }
      router.push(
        {
          query: searchParams.toString(),
        },
        undefined,
        { scroll: false }
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const lastDaysParam = router.query.last_days as DateFilter
  const lastDays: DateFilter =
    typeof lastDaysParam === 'string' &&
    Object.values(DateFilter).includes(lastDaysParam)
      ? lastDaysParam
      : DateFilter.Last7Days

  const { from, to } = useMemo(() => {
    const today = moment().utc()
    if (lastDays === DateFilter.Custom) {
      const fromParam = router.query.start_date as string
      const toParam = router.query.end_date as string

      const from =
        fromParam ||
        moment(today).subtract(+DateFilter.Last7Days, 'days').format(dateFormat)
      const to = toParam || moment(today).format(dateFormat)

      return { from, to }
    }

    const from = moment(today).subtract(+lastDays, 'days').format(dateFormat)
    const to =
      lastDays === DateFilter.Yesterday
        ? moment(today)
            .subtract(+DateFilter.Yesterday, 'days')
            .format(dateFormat)
        : moment(today).format(dateFormat)

    return { from, to }
  }, [lastDays, router.query.start_date, router.query.end_date])

  useEffect(() => {
    setDateRangePickerValue({
      from: moment(from).toDate(),
      to: moment(to).toDate(),
      selectValue: lastDays === DateFilter.Custom ? undefined : lastDays,
    })
  }, [from, to, lastDays])

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

  return {
    from,
    to,
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

export function useParams<T extends string>({
  key,
  defaultValue,
  values,
}: {
  key: string
  defaultValue?: T
  values: T[]
}): [T, (param: T) => void] {
  const router = useRouter()
  const param = router.query[key] as T
  const value =
    typeof param === 'string' && values.includes(param)
      ? param
      : defaultValue ?? values[0]

  const setParam = (param: T) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(key, param)
    router.push(
      {
        query: searchParams.toString(),
      },
      undefined,
      { scroll: false }
    )
  }

  return [value, setParam]
}

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
