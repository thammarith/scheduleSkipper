import { Icon } from './Icon'
import './Page.css'

/** The glass back button and the blue Done button. There is nowhere to go back to yet. */
export function PageNav({ onDone }: { onDone: () => void }) {
  return (
    <nav className="nav" aria-label="Page">
      <button type="button" className="nav-back" aria-label="Back" onClick={() => {}}>
        <Icon name="chevronLeft" size={22} stroke={2.4} />
      </button>
      <button type="button" className="nav-done" aria-label="Done" onClick={onDone}>
        <Icon name="check" size={20} stroke={2.6} />
      </button>
    </nav>
  )
}
