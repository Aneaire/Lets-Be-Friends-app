import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
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
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Calendar
            </h1>
            <p className="text-base text-muted-foreground mt-1.5">
              Select a date to continue
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'rounded-full transition-colors hover:bg-primary/10 hover:text-primary'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-foreground min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'rounded-full transition-colors hover:bg-primary/10 hover:text-primary'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-6">
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
              months: 'flex flex-col gap-8',
              month: 'flex flex-col gap-3',
              caption: 'hidden',
              nav: 'hidden',
              table: 'w-full border-collapse',
              head_row: 'flex w-full gap-1',
              head_cell: 'text-muted-foreground text-xs font-medium text-center py-2 w-10',
              row: 'flex w-full gap-1',
              cell: 'text-center text-sm relative',
              button: 'h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 hover:bg-muted/50',
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
          <div className="bg-primary/5 rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Selected date</p>
                <p className="text-lg font-semibold text-foreground truncate">
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
      <div className="w-full max-w-3xl">
        <Calendar
          selected={date}
          onSelect={setDate}
          className="shadow-xl"
        />
      </div>
    </div>
  )
}
