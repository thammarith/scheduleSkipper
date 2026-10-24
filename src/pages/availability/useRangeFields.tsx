import { useState, type ReactNode } from 'react'
import type { TimeRange } from '../../interfaces/availability'
import { ALL_DAY, DAY, sameRange, span } from '../../utils/availability'
import { clock, parseClock } from '../../utils/format'
import { TimeField } from './TimeField'

const h = (hours: number) => hours * 60

const PRESETS: Array<{ name: string; range: TimeRange }> = [
  { name: 'All day', range: ALL_DAY },
  { name: 'Morning', range: span(h(8), h(12)) },
  { name: 'Afternoon', range: span(h(12), h(17)) },
  { name: 'Evening', range: span(h(18), h(23)) },
  { name: 'Night', range: span(h(22), h(26)) },
]

/** A preset's hours in short, "08" rather than "08:00", so the chips stay narrow. */
const hours = (minutes: number) => clock(minutes).replace(/:00$/, '')

/** What a new time starts as: a plain working day, so no preset is picked yet. */
const NEW_TIME = { start: h(9), end: h(17) }

/**
 * The draft behind the presets and the From and To fields. `draft` is the time they describe, or null while
 * a field is empty. `fields` is the controls to render.
 */
export function useRangeFields(range: TimeRange | null): { draft: TimeRange | null; fields: ReactNode } {
  const initial = range?.kind === 'span' ? range : NEW_TIME
  const [allDay, setAllDay] = useState(range?.kind === 'allDay')
  // The inputs' own `HH:MM` text, so a half-typed or cleared time stays as the person left it.
  const [fromText, setFromText] = useState(clock(initial.start))
  const [toText, setToText] = useState(clock(initial.end))

  const from = parseClock(fromText)
  const to = parseClock(toText)
  // To before From means the time ends the next day. The same time would be a whole day: that is "All day".
  const sameTime = !allDay && from !== null && from === to
  const endsNextDay = !allDay && from !== null && to !== null && to < from
  const draft: TimeRange | null =
    allDay ? ALL_DAY : from === null || to === null || sameTime ? null : span(from, endsNextDay ? to + DAY : to)

  const applyPreset = (preset: TimeRange) => {
    if (preset.kind === 'allDay') return setAllDay(true)
    setAllDay(false)
    setFromText(clock(preset.start))
    setToText(clock(preset.end))
  }

  const fields = (
    <>
      <fieldset className="presets">
        <legend className="visually-hidden">Presets</legend>
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="preset"
            aria-pressed={draft !== null && sameRange(preset.range, draft)}
            onClick={() => applyPreset(preset.range)}
          >
            <span className="footnote semibold">{preset.name}</span>
            {preset.range.kind === 'span' && (
              <span className="preset-range caption2 tabular">
                {hours(preset.range.start)}–{hours(preset.range.end)}
              </span>
            )}
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
      {sameTime && <p className="caption1 sheet-hint fields-hint">Start and end can’t be the same. For a whole day, pick All day.</p>}
    </>
  )
  return { draft, fields }
}
