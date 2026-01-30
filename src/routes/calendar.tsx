import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CustomCalendar } from '../components/ui/custom-calendar'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Calendar</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Select a date from the calendar below
          </p>

          <CustomCalendar
            selected={date}
            onSelect={setDate}
            className="rounded-xl border bg-card"
          />

          {date && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm font-medium">Selected date:</p>
              <p className="text-lg font-semibold mt-1">
                {date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
