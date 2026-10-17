import { useEffect, useRef, type ReactNode } from 'react'
import './Sheet.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  /** Id of the element that names the sheet. */
  labelledBy: string
  /** `sheet` is a bottom sheet with a grabber; `action` is an iOS action sheet. */
  variant?: 'sheet' | 'action'
  children: ReactNode
}

/**
 * A modal sheet built on <dialog>, which brings focus trapping, Escape and an inert page for free.
 * Stays mounted while closed so it can animate out.
 */
export function Sheet({ open, onClose, labelledBy, variant = 'sheet', children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    // Keyboards close it with Escape; the click handler only adds tapping the backdrop.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={`sheet sheet--${variant}`}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // A click on the dialog box itself (not its content) is a click on the backdrop.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {variant === 'sheet' && <div className="sheet-grabber" aria-hidden="true" />}
      {children}
    </dialog>
  )
}
