import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../lib/utils'
import { buttonVariants } from './button'

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
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <DayPicker
        month={currentMonth}
        selected={selected}
        onMonthChange={handleMonthChange}
        onSelect={onSelect}
        disabled={disabled}
        mode="single"
        formatters={{
          formatWeekdayName: (date) => format(date, 'EEE'),
        }}
        classNames={{
          months: 'flex flex-col',
          month: 'space-y-4',
          caption: 'hidden',
          nav: 'hidden',
          button: 'h-9 w-9 p-0 font-normal rounded-lg transition-all hover:bg-primary/10 hover:text-primary focus:bg-primary/20 focus:text-primary focus:outline-none',
          day_today: 'bg-primary/10 text-primary font-semibold',
          day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold',
          day_outside: 'text-muted-foreground opacity-50',
          day_disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
          day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
          day_hidden: 'invisible',
          week: 'flex w-full mt-2',
          row: 'flex w-full',
          head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          cell: 'text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-outside)]:text-accent-foreground',
        }}
      />

      {selected && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>Selected: {format(selected, 'MMMM d, yyyy')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
