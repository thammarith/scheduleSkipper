import { Icon } from '../../ui/Icon'
import type { Tone } from '../../interfaces/availability'

interface SheetHeaderProps {
  id: string
  tone: Tone | 'plan'
  caption: string
  title: string
  onClose: () => void
  onSave: () => void
  saveDisabled?: boolean
}

/** Caption and title on the left, close and save on the right, as in design/time-editor-sheet.png. */
export function SheetHeader({ id, tone, caption, title, onClose, onSave, saveDisabled }: SheetHeaderProps) {
  return (
    <div className="sheet-header" data-tone={tone}>
      <div className="sheet-titles">
        <span className="caption1 semibold caps sheet-caption">{caption}</span>
        <h2 className="title2 tabular" id={id}>
          {title}
        </h2>
      </div>
      <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}>
        <Icon name="xmark" size={16} stroke={2.6} />
      </button>
      <button type="button" className="sheet-save" aria-label="Save" disabled={saveDisabled} onClick={onSave}>
        <Icon name="check" size={18} stroke={2.6} />
      </button>
    </div>
  )
}
