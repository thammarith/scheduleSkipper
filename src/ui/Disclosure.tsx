import { useId, type ReactNode } from 'react'
import { Icon } from './Icon'
import './Disclosure.css'

interface DisclosureProps {
  /** Picks the card's colours: a list's tone, or "plan" for the organiser's cards. */
  tone: string
  badge: ReactNode
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

/** A white card whose header discloses its content, with a spring height. */
export function Disclosure({ tone, badge, title, summary, open, onToggle, children }: DisclosureProps) {
  const id = useId()
  return (
    <section className="card" data-tone={tone} data-open={open} aria-labelledby={`${id}-title`}>
      <h2>
        <button type="button" className="card-head" aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}>
          {badge}
          <span className="card-titles">
            <span className="headline" id={`${id}-title`}>
              {title}
            </span>
            <span className="caption1 secondary">{summary}</span>
          </span>
          <Icon name="chevronDown" size={14} stroke={2.6} className="card-chevron" />
        </button>
      </h2>
      <div className="card-body" id={`${id}-body`} inert={!open}>
        <div className="card-clip">
          <div className="card-content">{children}</div>
        </div>
      </div>
    </section>
  )
}
