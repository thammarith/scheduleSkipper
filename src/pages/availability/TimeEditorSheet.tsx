import { useState } from 'react'
import type { TimeRange, Tone } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { ALL_DAY, DAY, sameRange, span, STEP } from '../../utils/availability'
import { dayLabel, dayLabelLong, planDates } from '../../utils/date'
import { pluralDays, rangeLabel } from '../../utils/format'
import { Icon } from '../../ui/Icon'
import { Wheel } from '../../ui/Wheel'
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

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

export const TIME_EDITOR_TITLE = 'time-editor-title'

interface TimeEditorProps {
  plan: Plan
  tone: Tone
  /** The group being edited, or null for a new time. */
  range: TimeRange | null
  dates: IsoDate[]
  onClose: () => void
  onSave: (range: TimeRange, dates: IsoDate[]) => void
  onSaveAndAddAnother: (range: TimeRange, dates: IsoDate[]) => void
  onDelete: () => void
}

/** The body of the time editor sheet. Mount it afresh for each group so the draft starts clean. */
export function TimeEditor({ plan, tone, range, dates, onClose, onSave, onSaveAndAddAnother, onDelete }: TimeEditorProps) {
  const initial = range?.kind === 'span' ? range : NEW_TIME
  const [allDay, setAllDay] = useState(range?.kind === 'allDay')
  const [from, setFrom] = useState(initial.start)
  const [to, setTo] = useState(initial.end % DAY)
  const [picked, setPicked] = useState(() => new Set(dates))

  // To at or before From means the time ends the next day.
  const endsNextDay = !allDay && to <= from
  const draft: TimeRange = allDay ? ALL_DAY : span(from, endsNextDay ? to + DAY : to)
  const chosen = planDates(plan).filter((d) => picked.has(d))
  const canSave = chosen.length > 0

  const applyPreset = (preset: TimeRange) => {
    if (preset.kind === 'allDay') return setAllDay(true)
    setAllDay(false)
    setFrom(preset.start)
    setTo(preset.end % DAY)
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
        title={rangeLabel(draft)}
        onClose={onClose}
        onSave={() => onSave(draft, chosen)}
        saveDisabled={!canSave}
      />

      <fieldset className="presets">
        <legend className="visually-hidden">Presets</legend>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="preset hit"
            aria-pressed={sameRange(preset.range, draft)}
            aria-label={preset.range.kind === 'allDay' ? undefined : `${preset.name}, ${rangeLabel(preset.range)}`}
            onClick={() => applyPreset(preset.range)}
          >
            <span className="footnote semibold">{preset.name}</span>
          </button>
        ))}
      </fieldset>

      <div className="pickers" data-dimmed={allDay}>
        <TimeWheels
          label="From"
          value={from}
          onChange={(value) => {
            setAllDay(false)
            setFrom(value)
          }}
        />
        <TimeWheels
          label="To"
          tag={endsNextDay ? 'Ends next day' : undefined}
          value={to}
          onChange={(value) => {
            setAllDay(false)
            setTo(value)
          }}
        />
      </div>

      <fieldset className="sheet-card">
        <div className="sheet-card-head">
          <legend className="footnote">On these days</legend>
          <span className={`caption1 ${canSave ? 'secondary' : 'sheet-hint'}`}>
            {canSave ? pluralDays(chosen.length) : 'Pick at least one day'}
          </span>
        </div>
        <ul className="day-toggles">
          {planDates(plan).map((date) => (
            <li key={date}>
              <button
                type="button"
                className="day-toggle hit"
                aria-pressed={picked.has(date)}
                aria-label={dayLabelLong(date)}
                onClick={() => toggle(date)}
              >
                <span className="caption1 semibold">{dayLabel(date)}</span>
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <button
        type="button"
        className="sheet-link"
        disabled={!canSave}
        onClick={() => onSaveAndAddAnother(draft, chosen)}
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

interface TimeWheelsProps {
  label: string
  tag?: string
  /** Minutes from midnight, 00:00–23:45. */
  value: number
  onChange: (value: number) => void
}

function TimeWheels({ label, tag, value, onChange }: TimeWheelsProps) {
  const hour = Math.floor(value / 60)
  const minute = value % 60
  return (
    <div className="picker">
      <div className="picker-label caption1 semibold secondary caps">
        <span>{label}</span>
        {tag && <span className="caption2 semibold">{tag}</span>}
      </div>
      <div className="picker-box">
        <span className="picker-band" aria-hidden="true" />
        <Wheel label={`${label} hour`} values={HOURS} index={hour} onChange={(i) => onChange(i * 60 + minute)} />
        <span className="headline" aria-hidden="true">
          :
        </span>
        <Wheel
          label={`${label} minutes`}
          values={MINUTES}
          index={minute / STEP}
          onChange={(i) => onChange(hour * 60 + i * STEP)}
        />
      </div>
    </div>
  )
}
