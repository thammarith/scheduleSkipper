import type { TimeRange } from '../../interfaces/availability'
import { sameRange } from '../../utils/availability'
import { rangeLabel } from '../../utils/format'
import { SheetHeader } from '../availability/SheetHeader'
import { useRangeFields } from '../availability/useRangeFields'

export const SLOT_EDITOR_TITLE = 'slot-editor-title'

interface SlotEditorProps {
  /** The slot being edited, or null for a new one. */
  range: TimeRange | null
  /** The other slots, so the same one can't be added twice. */
  others: TimeRange[]
  onClose: () => void
  onSave: (range: TimeRange) => void
  onDelete: () => void
}

/** The body of the sheet for one default time slot. Mount it afresh for each slot so the draft starts clean. */
export function SlotEditor({ range, others, onClose, onSave, onDelete }: SlotEditorProps) {
  const { draft, fields } = useRangeFields(range)
  const taken = draft !== null && others.some((other) => sameRange(other, draft))
  return (
    <div data-tone="plan">
      <SheetHeader
        id={SLOT_EDITOR_TITLE}
        tone="plan"
        caption={range ? 'Time slot' : 'New time slot'}
        title={draft ? rangeLabel(draft) : 'Pick a time'}
        onClose={onClose}
        onSave={() => draft && onSave(draft)}
        saveDisabled={!draft || taken}
      />
      {fields}
      {taken && <p className="caption1 sheet-hint fields-hint">That slot is already in the list.</p>}
      {range && (
        <button type="button" className="sheet-delete body" onClick={onDelete}>
          Delete this slot
        </button>
      )}
    </div>
  )
}
