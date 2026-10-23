import type { ReactNode } from 'react'
import type { Tone } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { dayLabel, dayLabelLong, holidayOn, isWeekend, planDates, weekdayMondayFirst } from '../../utils/date'
import { Mark } from './Mark'
import { TONE_PHRASE } from './tone'

const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface DayCalendarProps {
  plan: Plan
  tone: Tone
  picked: ReadonlySet<IsoDate>
  onToggle: (date: IsoDate) => void
  /** Dates in the other list, and that list's tone. Picking one moves its overlapping time here. */
  otherTone: Tone
  otherDates: ReadonlySet<IsoDate>
  /** Days that can be picked; the rest are greyed out. Everything when left out. */
  allowed?: ReadonlySet<IsoDate>
  /** Goes first in the fieldset, so it must hold the `<legend>`. */
  head: ReactNode
}

/** The plan's dates in a Monday-first grid, one checkbox per day. */
export function DayCalendar({ plan, tone, picked, onToggle, otherTone, otherDates, allowed, head }: DayCalendarProps) {
  return (
    <fieldset className="sheet-card calendar">
      {head}
      <div className="calendar-grid">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <abbr key={i} className="calendar-weekday caption2 semibold" data-red={i > 4} title={WEEKDAY_NAMES[i]}>
            {initial}
          </abbr>
        ))}
        {Array.from({ length: weekdayMondayFirst(plan.start) }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {planDates(plan).map((date) => {
          const selected = picked.has(date)
          const theirs = !selected && otherDates.has(date)
          const holiday = holidayOn(plan, date)
          const disabled = allowed ? !allowed.has(date) : false
          return (
            <label key={date} className="calendar-day" data-red={isWeekend(date) || Boolean(holiday)} data-disabled={disabled}>
              <input
                type="checkbox"
                className="visually-hidden"
                checked={selected}
                disabled={disabled}
                aria-label={[dayLabelLong(date), holiday?.name, theirs && `already ${TONE_PHRASE[otherTone]}`]
                  .filter(Boolean)
                  .join(', ')}
                onChange={() => onToggle(date)}
              />
              <span
                className="calendar-circle"
                data-state={selected ? 'mine' : theirs ? 'theirs' : 'none'}
                data-tone={theirs ? otherTone : tone}
              >
                <span className="footnote">{Number(date.slice(8))}</span>
                {selected && (
                  <span className="calendar-mark">
                    <Mark tone={tone} size={12} />
                  </span>
                )}
                {theirs && <span className="calendar-dot" />}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

interface CalendarNotesProps {
  plan: Plan
  picked: ReadonlySet<IsoDate>
  otherTone: Tone
  otherDates: ReadonlySet<IsoDate>
}

/** The key under a `DayCalendar`: the plan's holidays, and what the other list's dot means. */
export function CalendarNotes({ plan, picked, otherTone, otherDates }: CalendarNotesProps) {
  const dates = planDates(plan)
  const showsOther = dates.some((d) => otherDates.has(d) && !picked.has(d))
  return (
    <ul className="calendar-notes">
      {plan.holidays
        .filter((holiday) => dates.includes(holiday.date))
        .map((holiday) => (
          <li key={holiday.date} className="calendar-note">
            <span className="calendar-note-dot" style={{ background: 'var(--red)' }} />
            <span className="caption1 secondary">
              {dayLabel(holiday.date)} · {holiday.name}
            </span>
          </li>
        ))}
      {showsOther && (
        <li className="calendar-note" data-tone={otherTone}>
          <span className="calendar-note-dot" style={{ background: 'var(--tone-solid)' }} />
          <span className="caption1 secondary">Already {TONE_PHRASE[otherTone]} · tap to move here</span>
        </li>
      )}
    </ul>
  )
}
