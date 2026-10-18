import { useState } from 'react'
import type { TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { dayLabel, dayLabelLong, holidayOn, isWeekend, planDates, weekdayMondayFirst } from '../../utils/date'
import { rangeLabel } from '../../utils/format'
import { Mark } from './Mark'
import { ConflictWarning } from './ConflictWarning'
import { SheetHeader } from './SheetHeader'
import { TONE_NAME, TONE_PHRASE } from './tone'

export const DAY_PICKER_TITLE = 'day-picker-title'

const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


interface DayPickerProps {
  plan: Plan
  tone: Tone
  range: TimeRange
  dates: IsoDate[]
  /** Dates in the other list, and that list's tone. Picking one moves its overlapping time here. */
  otherTone: Tone
  otherDates: IsoDate[]
  conflictsWith: (dates: IsoDate[]) => IsoDate[]
  onClose: () => void
  onSave: (dates: IsoDate[]) => void
}

/** The body of the day picker sheet: the plan's dates in a Monday-first grid. */
export function DayPicker({
  plan,
  tone,
  range,
  dates,
  otherTone,
  otherDates,
  conflictsWith,
  onClose,
  onSave,
}: DayPickerProps) {
  const [picked, setPicked] = useState(() => new Set(dates))
  const all = planDates(plan)
  const other = new Set(otherDates)
  const showsOther = all.some((d) => other.has(d) && !picked.has(d))
  const chosen = all.filter((d) => picked.has(d))
  const overlap = conflictsWith(chosen)

  const toggle = (date: IsoDate) =>
    setPicked((current) => {
      const next = new Set(current)
      if (!next.delete(date)) next.add(date)
      return next
    })

  return (
    <div data-tone={tone}>
      <SheetHeader
        id={DAY_PICKER_TITLE}
        tone={tone}
        caption={`${TONE_NAME[tone]} · Add days`}
        title={rangeLabel(range)}
        onClose={onClose}
        onSave={() => onSave(chosen)}
      />

      <fieldset className="sheet-card calendar">
        <legend className="visually-hidden">Days in the plan</legend>
        <div className="calendar-grid">
          {WEEKDAY_INITIALS.map((initial, i) => (
            <abbr key={i} className="calendar-weekday caption2 semibold" data-red={i > 4} title={WEEKDAY_NAMES[i]}>
              {initial}
            </abbr>
          ))}
          {Array.from({ length: weekdayMondayFirst(plan.start) }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {all.map((date) => {
            const selected = picked.has(date)
            const theirs = !selected && other.has(date)
            const holiday = holidayOn(plan, date)
            return (
              <label key={date} className="calendar-day" data-red={isWeekend(date) || Boolean(holiday)}>
                <input
                  type="checkbox"
                  className="visually-hidden"
                  checked={selected}
                  aria-label={[dayLabelLong(date), holiday?.name, theirs && `already ${TONE_PHRASE[otherTone]}`]
                    .filter(Boolean)
                    .join(', ')}
                  onChange={() => toggle(date)}
                />
                <span className="calendar-circle" data-state={selected ? 'mine' : theirs ? 'theirs' : 'none'} data-tone={theirs ? otherTone : tone}>
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

      <ConflictWarning tone={tone} otherTone={otherTone} dates={overlap} />

      <ul className="calendar-notes">
        {plan.holidays
          .filter((holiday) => all.includes(holiday.date))
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
    </div>
  )
}
