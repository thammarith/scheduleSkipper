import { useEffect, useState } from 'react'
import type { Plan } from '../../interfaces/plan'
import type { AvailabilityStore, PlanEntry } from '../../interfaces/store'
import { dayLabelLong, planRangeLabel, today } from '../../utils/date'
import { pluralDays } from '../../utils/format'
import { Icon } from '../../ui/Icon'
import './HomePage.css'

interface HomePageProps {
  store: AvailabilityStore
  /** Opens a plan: its setup if it has no days yet, otherwise the page to mark times. */
  onOpen: (plan: Plan) => void
  onNew: () => void
}

/** Tile colours for the plans' icons, in turn. */
const TILES = ['var(--red)', 'var(--orange)', '#30b0c7', '#5856d6', 'var(--free-solid)']

const isDraft = (plan: Plan) => plan.possibleDays.length === 0

/** The home page: the person's plans, and what is waiting on them. */
export function HomePage({ store, onOpen, onNew }: HomePageProps) {
  const [entries, setEntries] = useState<PlanEntry[]>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let live = true
    store
      .listPlans()
      .then((loaded) => live && setEntries(loaded))
      .catch((reason: unknown) => live && setError(String(reason)))
    return () => {
      live = false
    }
  }, [store])

  if (error) return <p className="page-error body secondary">Couldn’t load your plans. {error}</p>
  if (!entries) return null
  const waiting = entries.find(({ plan, answered }) => !isDraft(plan) && !answered)

  return (
    <main className="page">
      <nav className="nav nav--end" aria-label="Page">
        <button type="button" className="nav-done" aria-label="New plan" onClick={onNew}>
          <Icon name="plus" size={20} stroke={2.6} />
        </button>
      </nav>

      <header className="page-header">
        <p className="footnote semibold secondary caps">{dayLabelLong(today())}</p>
        <h1 className="title1">Plans</h1>
      </header>

      <div className="page-content">
        {waiting && (
          <section className="card home-ask" aria-label="Waiting on you">
            <span className="home-ask-icon" aria-hidden="true">
              <Icon name="calendar" size={20} stroke={2.2} />
            </span>
            <span className="home-ask-text">
              <span className="headline">Mark your times</span>
              <span className="caption1 secondary">{waiting.plan.name} is waiting on you</span>
            </span>
            <button type="button" className="home-ask-button" onClick={() => onOpen(waiting.plan)}>
              <span className="footnote semibold">Mark</span>
            </button>
          </section>
        )}

        {entries.length > 0 ? (
          <>
            <h2 className="footnote secondary caps home-heading">Active</h2>
            <ul className="card home-list">
              {entries.map(({ plan, answered }, i) => (
                <li key={plan.id}>
                  <button type="button" className="home-row" onClick={() => onOpen(plan)}>
                    <span className="home-tile" style={{ background: TILES[i % TILES.length] }} aria-hidden="true">
                      <Icon name="calendar" size={20} stroke={2.2} />
                    </span>
                    <span className="home-row-text">
                      <span className="headline">{plan.name}</span>
                      <span className="caption1 secondary">
                        {isDraft(plan) ? 'Not set up yet' : `${pluralDays(plan.possibleDays.length)} · ${planRangeLabel(plan)}`}
                      </span>
                    </span>
                    <Status plan={plan} answered={answered} />
                    <Icon name="chevronRight" size={12} stroke={2.6} className="home-chevron" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="body secondary home-empty">No plans yet. Tap + to plan something.</p>
        )}
      </div>
    </main>
  )
}

function Status({ plan, answered }: { plan: Plan; answered: boolean }) {
  if (isDraft(plan)) return <span className="caption1 semibold secondary">Draft</span>
  if (answered) {
    return (
      <span className="home-status home-status--done caption1 semibold">
        <Icon name="check" size={11} stroke={3} />
        Answered
      </span>
    )
  }
  return <span className="home-status caption1 semibold">Your turn</span>
}
