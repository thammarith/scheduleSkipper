import { useState } from 'react'
import type { TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { ALL_DAY, DAY, sameRange, span, STEP } from '../../utils/availability'
import { planDates } from '../../utils/date'
import { clock, pluralDays, rangeLabel } from '../../utils/format'
import { Icon } from '../../ui/Icon'
import { ConflictWarning } from './ConflictWarning'
import { CalendarNotes, DayCalendar } from './DayCalendar'
import { SheetHeader } from './SheetHeader'
import { TONE_NAME } from './tone'

const h = (hours: number) => hours * 60

const PRESETS: Array<{ name: string; range: TimeRange }> = [
  { name: 'All day', range: ALL_DAY },
  { name: 'Morning', range: span(h(8), h(12)) },
  { name: 'Afternoon', range: span(h(12), h(17)) },
  { name: 'Evening', range: span(h(18), h(23)) },
  { name: 'Night', range: span(h(22), h(26)) },
]

/** What a new time starts as: a plain working day, so no preset is picked yet. */
const NEW_TIME = { start: h(9), end: h(17) }

/** Minutes from midnight for a time input's `HH:MM` value, down to the 15-minute step; null when empty. */
function toMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  return match ? Math.floor((Number(match[1]) * 60 + Number(match[2])) / STEP) * STEP : null
}

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
  const initial = range?.kind === 'span' ? range : NEW_TIME
  const [allDay, setAllDay] = useState(range?.kind === 'allDay')
  // The inputs' own `HH:MM` text, so a half-typed or cleared time stays as the person left it.
  const [fromText, setFromText] = useState(clock(initial.start))
  const [toText, setToText] = useState(clock(initial.end))
  const [picked, setPicked] = useState(() => new Set(dates))
  const other = new Set(otherDates)

  const from = toMinutes(fromText)
  const to = toMinutes(toText)
  // To at or before From means the time ends the next day.
  const endsNextDay = !allDay && from !== null && to !== null && to <= from
  const draft: TimeRange | null =
    allDay ? ALL_DAY : from === null || to === null ? null : span(from, endsNextDay ? to + DAY : to)
  const chosen = planDates(plan).filter((d) => picked.has(d))
  const canSave = draft !== null && chosen.length > 0
  const overlap = canSave ? conflictsWith(draft, chosen) : []

  const applyPreset = (preset: TimeRange) => {
    if (preset.kind === 'allDay') return setAllDay(true)
    setAllDay(false)
    setFromText(clock(preset.start))
    setToText(clock(preset.end))
  }

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

      <fieldset className="presets">
        <legend className="visually-hidden">Presets</legend>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="preset hit"
            aria-pressed={draft !== null && sameRange(preset.range, draft)}
            aria-label={preset.range.kind === 'allDay' ? undefined : `${preset.name}, ${rangeLabel(preset.range)}`}
            onClick={() => applyPreset(preset.range)}
          >
            <span className="footnote semibold">{preset.name}</span>
          </button>
        ))}
      </fieldset>

      <div className="pickers" data-dimmed={allDay}>
        <TimeField
          label="From"
          value={fromText}
          onChange={(value) => {
            setAllDay(false)
            setFromText(value)
          }}
        />
        <TimeField
          label="To"
          tag={endsNextDay ? 'Ends next day' : undefined}
          value={toText}
          onChange={(value) => {
            setAllDay(false)
            setToText(value)
          }}
        />
      </div>

      <DayCalendar
        plan={plan}
        tone={tone}
        picked={picked}
        onToggle={toggle}
        otherTone={otherTone}
        otherDates={other}
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

interface TimeFieldProps {
  label: string
  tag?: string
  /** The input's `HH:MM` value, or empty. */
  value: string
  onChange: (value: string) => void
}

function TimeField({ label, tag, value, onChange }: TimeFieldProps) {
  // Typed minutes off the 15-minute step snap down once the field loses focus.
  const snap = () => {
    const minutes = toMinutes(value)
    if (minutes !== null && clock(minutes) !== value) onChange(clock(minutes))
  }
  return (
    <label className="picker">
      <span className="picker-label caption1 semibold secondary caps">
        <span>{label}</span>
        {tag && <span className="caption2 semibold">{tag}</span>}
      </span>
      <input
        type="time"
        className="time-input"
        step={STEP * 60}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={snap}
      />
    </label>
  )
}
