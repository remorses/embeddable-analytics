import { Popover } from '@headlessui/react'
import { DateRangePicker, DateRangePickerItem } from '@tremor/react'

import { QuestionIcon } from './Icons'
import { subDays } from 'date-fns'

import {
  DateFilter as DateFilterType,
  DateRangePickerOption,
} from '../lib/types'
import { useDateFilter } from '../lib/hooks'

const dateFilterOptions: DateRangePickerOption[] = [
  { text: 'Today', value: DateFilterType.Today, startDate: new Date() },
  {
    text: 'Yesterday',
    value: DateFilterType.Yesterday,
    startDate: subDays(new Date(), 1),
  },
  {
    text: '7 days',
    value: DateFilterType.Last7Days,
    startDate: subDays(new Date(), 7),
  },
  {
    text: '30 days',
    value: DateFilterType.Last30Days,
    startDate: subDays(new Date(), 30),
  },
  {
    text: '12 months',
    value: DateFilterType.Last12Months,
    startDate: subDays(new Date(), 365),
  },
]

export default function DateFilter() {
  const { dateRangePickerValue, onDateRangePickerValueChange } = useDateFilter()
  // console.log({ dateRangePickerValue })
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-[165px]">
        <DateRangePicker
          value={dateRangePickerValue}
          onValueChange={onDateRangePickerValueChange}
          // options={dateFilterOptions}
          enableYearNavigation
        >
          {dateFilterOptions.map(({ text, value, startDate }) => (
            <DateRangePickerItem key={text} value={value} from={startDate}>
              {text}
            </DateRangePickerItem>
          ))}
        </DateRangePicker>
      </div>
    </div>
  )
}
