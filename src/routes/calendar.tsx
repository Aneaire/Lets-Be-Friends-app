import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../lib/utils'
import { buttonVariants } from '../components/ui/button'

interface CalendarProps {
  selected?: Date | undefined
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

export function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected ?? new Date())

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month)
  }

  return (
    <div className={cn('bg-card rounded-2xl shadow-sm', className)}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a date to continue
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-base font-medium text-foreground min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-4">
          <DayPicker
            month={currentMonth}
            selected={selected}
            onMonthChange={handleMonthChange}
            onSelect={onSelect}
            disabled={disabled}
            mode="single"
            showOutsideDays={true}
            formatters={{
              formatWeekdayName: (date) => format(date, 'EEE'),
            }}
            classNames={{
              months: 'flex flex-col gap-6',
              month: 'flex flex-col gap-2',
              caption: 'hidden',
              nav: 'hidden',
              table: 'w-full border-collapse',
              head_row: 'flex w-full',
              head_cell: 'text-muted-foreground text-xs font-medium text-center py-2 uppercase tracking-wide',
              row: 'flex w-full',
              cell: 'text-center text-sm relative',
              button: 'h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
              day_today: 'bg-primary/10 text-primary font-semibold',
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
              day_outside: 'text-muted-foreground opacity-40 hover:opacity-60',
              day_disabled: 'text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground',
              day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
            }}
          />
        </div>

        {selected && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-0.5">Selected date</p>
                <p className="text-base font-semibold text-foreground truncate">
                  {format(selected, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Calendar
          selected={date}
          onSelect={setDate}
          className="shadow-xl"
        />
      </div>
    </div>
  )
}
