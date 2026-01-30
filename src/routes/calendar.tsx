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
    <div className={cn('bg-card rounded-2xl shadow-sm max-w-[420px] mx-auto', className)}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a date to continue
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'h-8 w-8 rounded-full transition-colors hover:bg-primary/10 hover:text-primary'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground min-w-[100px] text-center">
              {format(currentMonth, 'MMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'h-8 w-8 rounded-full transition-colors hover:bg-primary/10 hover:text-primary'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
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
              months: 'flex flex-col',
              month: 'space-y-0',
              caption: 'sr-only',
              nav: 'hidden',
              table: 'w-full border-collapse',
              head_row: 'flex w-full border-b bg-muted/20',
              head_cell: 'flex-1 text-muted-foreground/70 text-xs font-medium text-center py-3 uppercase tracking-wider',
              row: 'flex w-full',
              cell: 'flex-1 text-sm relative border-r last:border-r-0 border-b last:border-b-0',
              button: 'w-full h-14 flex items-center justify-center text-sm font-medium transition-all duration-150 focus:outline-none focus:bg-muted/50 hover:bg-muted/30',
              day_today: 'bg-primary/10 text-primary font-semibold',
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-bold shadow-inner',
              day_outside: 'text-muted-foreground/30 bg-muted/10',
              day_disabled: 'text-muted-foreground/20 opacity-50 cursor-not-allowed hover:bg-transparent',
              day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
            }}
          />
        </div>

        {selected && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Selected</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {format(selected, 'EEEE, MMM d, yyyy')}
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Calendar
        selected={date}
        onSelect={setDate}
      />
    </div>
  )
}
