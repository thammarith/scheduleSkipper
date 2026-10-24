import { useState } from 'react'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { datesInMonth, monthLabel, monthOf, shiftMonth } from '../../utils/date'
import { Icon } from '../../ui/Icon'
import { CalendarNotes, DayCalendar } from '../availability/DayCalendar'

interface MonthCalendarProps {
  plan: Plan
  picked: ReadonlySet<IsoDate>
  onToggle: (date: IsoDate) => void
}

/** Any day of any month, one month at a time, for picking the days a plan could happen on. */
export function MonthCalendar({ plan, picked, onToggle }: MonthCalendarProps) {
  const [month, setMonth] = useState(monthOf(plan.possibleDays[0] ?? plan.start))
  const dates = datesInMonth(month)
  const noOthers = new Set<IsoDate>()
  return (
    <>
      <div className="month-nav">
        <button type="button" className="month-step hit" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
          <Icon name="chevronLeft" size={14} stroke={2.6} />
        </button>
        <h3 className="headline" aria-live="polite">
          {monthLabel(month)}
        </h3>
        <button type="button" className="month-step hit" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
          <Icon name="chevronRight" size={14} stroke={2.6} />
        </button>
      </div>
      <DayCalendar
        plan={plan}
        dates={dates}
        tone="free"
        picked={picked}
        onToggle={onToggle}
        otherTone="busy"
        otherDates={noOthers}
        head={<legend className="visually-hidden">Days in {monthLabel(month)}</legend>}
      />
      <CalendarNotes plan={plan} dates={dates} picked={picked} otherTone="busy" otherDates={noOthers} />
    </>
  )
}
