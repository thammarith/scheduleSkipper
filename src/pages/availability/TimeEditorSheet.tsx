import { useState } from 'react'
import type { TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { planDates } from '../../utils/date'
import { pluralDays, rangeLabel } from '../../utils/format'
import { Icon } from '../../ui/Icon'
import { ConflictWarning } from './ConflictWarning'
import { CalendarNotes, DayCalendar } from './DayCalendar'
import { useRangeFields } from './useRangeFields'
import { SheetHeader } from './SheetHeader'
import { TONE_NAME } from './tone'

export const TIME_EDITOR_TITLE = 'time-editor-title'

interface TimeEditorProps {
  plan: Plan
  tone: Tone
  /** The other list's tone, its dates, and the dates a save would take from it. */
  otherTone: Tone
  otherDates: IsoDate[]
  conflictsWith: (range: TimeRange, dates: IsoDate[]) => IsoDate[]
  /** The group being edited, or null for a new time. */
  range: TimeRange | null
  dates: IsoDate[]
  onClose: () => void
  onSave: (range: TimeRange, dates: IsoDate[]) => void
  onSaveAndAddAnother: (range: TimeRange, dates: IsoDate[]) => void
  onDelete: () => void
}

/** The body of the time editor sheet. Mount it afresh for each group so the draft starts clean. */
export function TimeEditor({
  plan,
  tone,
  otherTone,
  otherDates,
  conflictsWith,
  range,
  dates,
  onClose,
  onSave,
  onSaveAndAddAnother,
  onDelete,
}: TimeEditorProps) {
  const { draft, fields } = useRangeFields(range)
  const [picked, setPicked] = useState(() => new Set(dates))
  const other = new Set(otherDates)
  const chosen = planDates(plan).filter((d) => picked.has(d))
  const canSave = draft !== null && chosen.length > 0
  const overlap = canSave ? conflictsWith(draft, chosen) : []

  const toggle = (date: IsoDate) =>
    setPicked((current) => {
      const next = new Set(current)
      if (!next.delete(date)) next.add(date)
      return next
    })

  return (
    <div data-tone={tone}>
      <SheetHeader
        id={TIME_EDITOR_TITLE}
        tone={tone}
        caption={range ? TONE_NAME[tone] : `New · ${TONE_NAME[tone]}`}
        title={draft ? rangeLabel(draft) : 'Pick a time'}
        onClose={onClose}
        onSave={() => draft && onSave(draft, chosen)}
        saveDisabled={!canSave}
      />

      {fields}

      <DayCalendar
        plan={plan}
        tone={tone}
        picked={picked}
        onToggle={toggle}
        otherTone={otherTone}
        otherDates={other}
        allowed={new Set(plan.possibleDays)}
        head={
          <legend className="sheet-card-head calendar-head">
            <span className="footnote">On these days</span>
            <span className={`caption1 ${chosen.length > 0 ? 'secondary' : 'sheet-hint'}`}>
              {chosen.length > 0 ? pluralDays(chosen.length) : 'Pick at least one day'}
            </span>
          </legend>
        }
      />

      <ConflictWarning tone={tone} otherTone={otherTone} dates={overlap} />

      <CalendarNotes plan={plan} picked={picked} otherTone={otherTone} otherDates={other} />

      <button
        type="button"
        className="sheet-link"
        disabled={!canSave}
        onClick={() => draft && onSaveAndAddAnother(draft, chosen)}
      >
        <Icon name="plus" size={14} stroke={2.6} />
        <span className="footnote semibold">Add another time for these days</span>
      </button>

      {range && (
        <button type="button" className="sheet-delete body" onClick={onDelete}>
          Delete this time
        </button>
      )}
    </div>
  )
}
