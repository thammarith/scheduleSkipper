import { Icon } from './Icon'
import './Page.css'

/** The glass back button and the blue Done button. */
export function PageNav({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  return (
    <nav className="nav" aria-label="Page">
      <button type="button" className="nav-back" aria-label="Back" onClick={onBack}>
        <Icon name="chevronLeft" size={22} stroke={2.4} />
      </button>
      <button type="button" className="nav-done" aria-label="Done" onClick={onDone}>
        <Icon name="check" size={20} stroke={2.6} />
      </button>
    </nav>
  )
}
