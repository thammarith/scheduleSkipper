import { useState } from 'react'
import type { TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { planDates } from '../../utils/date'
import { rangeLabel } from '../../utils/format'
import { ConflictWarning } from './ConflictWarning'
import { CalendarNotes, DayCalendar } from './DayCalendar'
import { SheetHeader } from './SheetHeader'
import { TONE_NAME } from './tone'

export const DAY_PICKER_TITLE = 'day-picker-title'

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

/** The body of the day picker sheet: which days a time applies to. */
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
  const other = new Set(otherDates)
  const chosen = planDates(plan).filter((d) => picked.has(d))
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

      <DayCalendar
        plan={plan}
        tone={tone}
        picked={picked}
        onToggle={toggle}
        otherTone={otherTone}
        otherDates={other}
        allowed={new Set(plan.possibleDays)}
        head={<legend className="visually-hidden">Days in the plan</legend>}
      />

      <ConflictWarning tone={tone} otherTone={otherTone} dates={overlap} />

      <CalendarNotes plan={plan} picked={picked} otherTone={otherTone} otherDates={other} />
    </div>
  )
}
