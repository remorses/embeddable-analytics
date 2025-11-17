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
import { useQueryStates, parseAsString } from 'nuqs'

type DateRangePickerValue = {
  from?: Date
  to?: Date
  selectValue?: string
}

export function useDateFilter() {
  const [params, setParams] = useQueryStates(
    {
      last_days: parseAsString.withDefault(DateFilter.Last7Days),
      start_date: parseAsString,
      end_date: parseAsString,
    },
    {
      shallow: true,
      history: 'push',
    }
  )

  const [dateRangePickerValue, setDateRangePickerValue] =
    useState<DateRangePickerValue>()

  const lastDays: DateFilter =
    typeof params.last_days === 'string' &&
    Object.values(DateFilter).includes(params.last_days as DateFilter)
      ? (params.last_days as DateFilter)
      : DateFilter.Last7Days

  const { from: date_from, to: date_to } = useMemo(() => {
    const today = new Date()

    if (lastDays === DateFilter.Custom) {
      const from = params.start_date || format(subDays(today, 7), dateFormat)
      const to = params.end_date || format(today, dateFormat)

      return { from, to }
    }

    const from = format(subDays(today, Number(lastDays)), dateFormat)
    const to =
      lastDays === DateFilter.Yesterday
        ? format(subDays(today, 1), dateFormat)
        : format(today, dateFormat)

    return { from, to }
  }, [lastDays, params.start_date, params.end_date])

  useEffect(() => {
    const from = new Date(date_from)
    const to = new Date(date_to)
    setDateRangePickerValue({
      from,
      to,
      selectValue: lastDays === DateFilter.Custom ? undefined : lastDays,
    })
  }, [date_from, date_to, lastDays])

  const onDateRangePickerValueChange = useCallback(
    ({ from, to, selectValue }: DateRangePickerValue) => {
      if (from && to) {
        const lastDays = selectValue ?? DateFilter.Custom

        if (lastDays === DateFilter.Custom && from && to) {
          setParams({
            last_days: lastDays,
            start_date: format(from, dateFormat),
            end_date: format(to, dateFormat),
          })
        } else {
          setParams({
            last_days: lastDays,
            start_date: null,
            end_date: null,
          })
        }
      } else {
        setDateRangePickerValue({ from, to, selectValue })
      }
    },
    [setParams]
  )

  return {
    date_from,
    date_to,
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
    // return 'loading'
    if (!data && !error) return 'loading'
    if (isValidating) return 'updating'
    if (error) return 'error'
    if (!!data) return 'success'
    return 'idle'
  }

  return { ...query, warning, status: getStatus() }
}
