import { useState } from 'react'
import type { TimeRange } from '../../interfaces/availability'
import type { IsoDate } from '../../interfaces/plan'
import { rangeKey } from '../../utils/availability'
import { dayLabel, dayLabelLong } from '../../utils/date'
import { rangeLabel, rangeSpoken } from '../../utils/format'
import { tidySlots } from '../../utils/plan'
import { Icon } from '../../ui/Icon'
import { SheetHeader } from '../availability/SheetHeader'
import { useRangeFields } from '../availability/useRangeFields'

export const OVERRIDE_TITLE = 'override-title'
export const OVERRIDE_PICKER_TITLE = 'override-picker-title'

interface OverrideEditorProps {
  date: IsoDate
  /** The windows the day starts with: its own, or a copy of the defaults. */
  ranges: TimeRange[]
  defaults: TimeRange[]
  /** Whether the day already has its own windows. */
  overridden: boolean
  onClose: () => void
  onSave: (ranges: TimeRange[]) => void
  onReset: () => void
  onRemoveDay: () => void
}

/** The body of the sheet that gives one day its own time slots. Mount it afresh for each day. */
export function OverrideEditor({ date, ranges, defaults, overridden, onClose, onSave, onReset, onRemoveDay }: OverrideEditorProps) {
  const [list, setList] = useState(() => tidySlots(ranges))
  const { draft, fields } = useRangeFields(null)

  return (
    <div data-tone="plan">
      <SheetHeader
        id={OVERRIDE_TITLE}
        tone="plan"
        caption="Different times"
        title={dayLabelLong(date)}
        onClose={onClose}
        onSave={() => onSave(list)}
        saveDisabled={list.length === 0}
      />

      <ul className="sheet-card override-list" aria-label={`Time slots on ${dayLabel(date)}`}>
        {list.map((range) => (
          <li key={rangeKey(range)} className="override-item">
            <span className="headline tabular">{rangeLabel(range)}</span>
            <button
              type="button"
              className="override-remove hit"
              aria-label={`Remove ${rangeSpoken(range)}`}
              onClick={() => setList((current) => current.filter((r) => rangeKey(r) !== rangeKey(range)))}
            >
              <Icon name="xmark" size={14} stroke={2.6} />
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="caption1 sheet-hint">Add at least one time</li>}
      </ul>

      {fields}
      <button
        type="button"
        className="sheet-link"
        disabled={!draft}
        onClick={() => draft && setList((current) => tidySlots([...current, draft]))}
      >
        <Icon name="plus" size={14} stroke={2.6} />
        <span className="footnote semibold">Add this time</span>
      </button>

      <p className="caption1 secondary override-note">
        {defaults.length > 0
          ? `Replaces the other slots (${defaults.map(rangeLabel).join(', ')}) for this day only.`
          : 'This day has its own times.'}
      </p>

      {overridden && (
        <button type="button" className="sheet-link" onClick={onReset}>
          <span className="body">Reset to default slots</span>
        </button>
      )}
      <button type="button" className="sheet-delete body" onClick={onRemoveDay}>
        Remove this day from the plan
      </button>
    </div>
  )
}

interface OverridePickerProps {
  dates: IsoDate[]
  onClose: () => void
  onPick: (date: IsoDate) => void
}

/** The body of the sheet that picks which day to give its own time slots. */
export function OverridePicker({ dates, onClose, onPick }: OverridePickerProps) {
  return (
    <div data-tone="plan">
      <div className="sheet-header">
        <div className="sheet-titles">
          <span className="caption1 semibold caps sheet-caption">Different times</span>
          <h2 className="title2" id={OVERRIDE_PICKER_TITLE}>
            Which day?
          </h2>
        </div>
        <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}>
          <Icon name="xmark" size={16} stroke={2.6} />
        </button>
      </div>
      <ul className="sheet-card override-list">
        {dates.map((date) => (
          <li key={date}>
            <button type="button" className="override-pick" onClick={() => onPick(date)}>
              <span className="headline">{dayLabelLong(date)}</span>
              <Icon name="chevronRight" size={12} stroke={2.6} className="group-chevron" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
