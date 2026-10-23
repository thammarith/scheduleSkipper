import type { TimeRange } from '../../interfaces/availability'
import { rangeLabel } from '../../utils/format'
import { SheetHeader } from '../availability/SheetHeader'
import { useRangeFields } from '../availability/useRangeFields'

export const SLOT_EDITOR_TITLE = 'slot-editor-title'

interface SlotEditorProps {
  /** The slot being edited, or null for a new one. */
  range: TimeRange | null
  onClose: () => void
  onSave: (range: TimeRange) => void
  onDelete: () => void
}

/** The body of the sheet for one default time slot. Mount it afresh for each slot so the draft starts clean. */
export function SlotEditor({ range, onClose, onSave, onDelete }: SlotEditorProps) {
  const { draft, fields } = useRangeFields(range)
  return (
    <div data-tone="plan">
      <SheetHeader
        id={SLOT_EDITOR_TITLE}
        tone="plan"
        caption={range ? 'Time slot' : 'New time slot'}
        title={draft ? rangeLabel(draft) : 'Pick a time'}
        onClose={onClose}
        onSave={() => draft && onSave(draft)}
        saveDisabled={!draft}
      />
      {fields}
      {range && (
        <button type="button" className="sheet-delete body" onClick={onDelete}>
          Delete this slot
        </button>
      )}
    </div>
  )
}
