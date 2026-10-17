import { useEffect, useLayoutEffect, useRef } from 'react'
import { Icon } from '../../ui/Icon'

interface DayMenuProps {
  anchor: HTMLElement
  /** Spoken label for the action, such as "Remove Mon 19 from 18:00 to 23:00". */
  label: string
  onRemove: () => void
  onClose: () => void
}

/** A small context menu under a day chip. Uses the popover API for light dismiss and Escape. */
export function DayMenu({ anchor, label, onRemove, onClose }: DayMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const menu = ref.current
    if (!menu) return
    menu.showPopover()
    const box = anchor.getBoundingClientRect()
    const below = box.bottom + 8 + menu.offsetHeight <= window.innerHeight - 8
    menu.style.top = `${below ? box.bottom + 8 : box.top - 8 - menu.offsetHeight}px`
    menu.style.left = `${Math.min(Math.max(8, box.left), window.innerWidth - menu.offsetWidth - 8)}px`
    menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [anchor])

  useEffect(() => {
    const menu = ref.current
    if (!menu) return
    const onToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === 'closed') onClose()
    }
    const dismiss = () => menu.hidePopover()
    menu.addEventListener('toggle', onToggle)
    window.addEventListener('scroll', dismiss, { passive: true })
    window.addEventListener('resize', dismiss)
    return () => {
      menu.removeEventListener('toggle', onToggle)
      window.removeEventListener('scroll', dismiss)
      window.removeEventListener('resize', dismiss)
    }
  }, [onClose])

  return (
    <div ref={ref} popover="auto" className="menu" role="menu">
      <button type="button" role="menuitem" className="menu-item" aria-label={label} onClick={onRemove}>
        <span className="body">Remove from this time</span>
        <Icon name="trash" size={18} stroke={2} />
      </button>
    </div>
  )
}
