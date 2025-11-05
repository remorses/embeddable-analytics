import React from 'react'
import { RiArrowDownSLine, RiCalendar2Line } from '@remixicon/react'
import { subDays } from 'date-fns'

import {
  DateFilter as DateFilterType,
  DateRangePickerOption,
} from '../lib/types'
import { useDateFilter } from '../lib/hooks'
import { cx, focusInput } from '../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu'

const dateFilterOptions: DateRangePickerOption[] = [
  { text: 'Today', value: DateFilterType.Today, startDate: new Date() },
  {
    text: 'Yesterday',
    value: DateFilterType.Yesterday,
    startDate: subDays(new Date(), 1),
  },
  {
    text: 'Last 7 days',
    value: DateFilterType.Last7Days,
    startDate: subDays(new Date(), 7),
  },
  {
    text: 'Last 30 days',
    value: DateFilterType.Last30Days,
    startDate: subDays(new Date(), 30),
  },
  {
    text: 'Last 12 months',
    value: DateFilterType.Last12Months,
    startDate: subDays(new Date(), 365),
  },
]

export default function DateFilter() {
  const { dateRangePickerValue, onDateRangePickerValueChange } = useDateFilter()

  const getSelectedLabel = () => {
    const selectValue = dateRangePickerValue?.selectValue
    const option = dateFilterOptions.find((opt) => opt.value === selectValue)
    return option?.text || 'Last 30 days'
  }

  const handleItemClick = (value: string, startDate: Date) => {
    onDateRangePickerValueChange({
      from: startDate,
      to: new Date(),
      selectValue: value,
    })
  }

  return (
    <div className="flex items-center text-sm gap-4">
      <div className="inline-flex items-center rounded shadow-sm">
        <span className="rounded-l border border-border bg-background px-3 py-2 focus:z-10">
          <RiCalendar2Line
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden={true}
          />
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cx(
                focusInput,
                '-ml-px flex items-center gap-2 rounded-r border border-border bg-background px-4 py-2 font-medium text-foreground transition-colors hover:bg-accent focus:z-10 focus:outline-none',
              )}
            >
              {getSelectedLabel()}
              <RiArrowDownSLine
                className="-mr-1 size-5 shrink-0"
                aria-hidden={true}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]">
            {dateFilterOptions.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => {
                  handleItemClick(item.value, item.startDate)
                }}
              >
                {item.text}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
