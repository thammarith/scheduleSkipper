import { useEffect, useState } from 'react'
import type { TimeRange } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import type { AvailabilityStore } from '../../interfaces/store'
import { rangeKey, sameRange } from '../../utils/availability'
import { dayLabel } from '../../utils/date'
import { endsNextDay, rangeLabel, rangeSpoken, slotsSummary, summary } from '../../utils/format'
import { normalisePlan, setOverride, setSlots, slotsFor, togglePossibleDay } from '../../utils/plan'
import { Disclosure } from '../../ui/Disclosure'
import { Icon } from '../../ui/Icon'
import { PageNav } from '../../ui/PageNav'
import { Sheet } from '../../ui/Sheet'
import { CalendarNotes, DayCalendar } from '../availability/DayCalendar'
import { rangeIcon } from '../availability/tone'
import '../availability/sheets.css'
import { OVERRIDE_PICKER_TITLE, OVERRIDE_TITLE, OverrideEditor, OverridePicker } from './OverrideSheet'
import { SLOT_EDITOR_TITLE, SlotEditor } from './SlotEditorSheet'
import './SetupPage.css'

interface SetupPageProps {
  store: AvailabilityStore
  planId: string
  onBack: () => void
  /** Called once the plan is saved. */
  onSaved: () => void
}

/** The organiser's page: which days are possible, and which time slots guests choose from. */
export function SetupPage({ store, planId, onBack, onSaved }: SetupPageProps) {
  const [plan, setPlan] = useState<Plan>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let live = true
    store
      .getPlan(planId)
      .then((loaded) => live && setPlan(normalisePlan(loaded)))
      .catch((reason: unknown) => live && setError(String(reason)))
    return () => {
      live = false
    }
  }, [store, planId])

  if (error) return <p className="page-error body secondary">Couldn’t load this plan. {error}</p>
  if (!plan) return null
  return <SetupEditor initial={plan} onBack={onBack} onSave={(next) => store.savePlan(next).then(onSaved)} />
}

type SheetState =
  | { kind: 'slot'; range: TimeRange | null }
  | { kind: 'override'; date: IsoDate }
  | { kind: 'pick' }

function SetupEditor({ initial, onBack, onSave }: { initial: Plan; onBack: () => void; onSave: (plan: Plan) => Promise<void> }) {
  const [plan, setPlan] = useState(initial)
  const [open, setOpen] = useState({ days: true, slots: false })
  // The sheet's content outlives `sheetOpen` so it can animate out; `id` remounts it with a fresh draft.
  const [sheet, setSheet] = useState<SheetState & { id: number }>()
  const [sheetOpen, setSheetOpen] = useState(false)

  const showSheet = (next: SheetState) => {
    setSheet((current) => ({ ...next, id: (current?.id ?? 0) + 1 }))
    setSheetOpen(true)
  }
  const closeSheet = () => setSheetOpen(false)
  const update = (change: (plan: Plan) => Plan) => {
    setPlan(change)
    closeSheet()
  }

  const hasSlots = plan.slots.length > 0
  const overridden = Object.keys(plan.overrides).sort()
  const canOverride = plan.possibleDays.some((date) => !(date in plan.overrides))
  const allowed = new Set(plan.possibleDays)
  const toggle = (key: 'days' | 'slots') => setOpen((current) => ({ ...current, [key]: !current[key] }))

  return (
    <main className="page">
      <PageNav onBack={onBack} onDone={() => onSave(plan)} />

      <header className="page-header">
        <p className="footnote semibold secondary caps">Set up your plan</p>
        <h1 className="title1">Which days work?</h1>
      </header>

      <div className="page-content">
        <Disclosure
          tone="plan"
          badge={
            <span className="badge" aria-hidden="true">
              <Icon name="calendar" size={16} stroke={2.4} />
            </span>
          }
          title="Possible days"
          summary={summary(plan.possibleDays)}
          open={open.days}
          onToggle={() => toggle('days')}
        >
          <DayCalendar
            plan={plan}
            tone="free"
            picked={allowed}
            onToggle={(date) => setPlan((current) => togglePossibleDay(current, date))}
            otherTone="busy"
            otherDates={new Set()}
            head={<legend className="visually-hidden">Days guests can answer for</legend>}
          />
          <CalendarNotes plan={plan} picked={allowed} otherTone="busy" otherDates={new Set()} />
        </Disclosure>

        <Disclosure
          tone="plan"
          badge={
            <span className="badge" aria-hidden="true">
              <Icon name="clock" size={16} stroke={2.4} />
            </span>
          }
          title="Time slots"
          summary={slotsSummary(plan, open.slots)}
          open={open.slots}
          onToggle={() => toggle('slots')}
        >
          {hasSlots ? (
            <ul className="slot-rows">
              {plan.slots.map((range) => (
                <li key={rangeKey(range)}>
                  <button
                    type="button"
                    className="slot-row"
                    aria-label={`Edit ${rangeSpoken(range)}`}
                    onClick={() => showSheet({ kind: 'slot', range })}
                  >
                    <Icon name={rangeIcon(range)} size={15} stroke={2.4} />
                    <span className="headline tabular slot-row-label">{rangeLabel(range)}</span>
                    {endsNextDay(range) && <span className="caption2 semibold secondary caps">Ends next day</span>}
                    <Icon name="chevronRight" size={12} stroke={2.6} className="group-chevron" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="slot-empty body secondary">
              <strong className="headline">No time slots yet</strong>
              Add the times you’re considering, like 18:00 – 20:00. Guests will then pick from them.
            </p>
          )}
          <button type="button" className="another" onClick={() => showSheet({ kind: 'slot', range: null })}>
            <Icon name="plus" size={14} stroke={2.6} />
            <span className="footnote semibold">Add a slot</span>
          </button>

          {hasSlots ? (
            <div className="overrides">
              <h3 className="footnote semibold secondary caps">Different times on some days</h3>
              {overridden.length > 0 && (
                <ul>
                  {overridden.map((date) => (
                    <li key={date} className="override-row">
                      <span className="override-date footnote semibold">{dayLabel(date)}</span>
                      <span className="override-ranges body">
                        {plan.overrides[date].map(rangeLabel).join(', ')}
                        <span className="caption1 secondary">Instead of the slots above</span>
                      </span>
                      <button
                        type="button"
                        className="override-edit hit body"
                        aria-label={`Edit times on ${dayLabel(date)}`}
                        onClick={() => showSheet({ kind: 'override', date })}
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="another" disabled={!canOverride} onClick={() => showSheet({ kind: 'pick' })}>
                <Icon name="plus" size={14} stroke={2.6} />
                <span className="footnote semibold">Override a day</span>
              </button>
            </div>
          ) : (
            <p className="slot-tip caption1 secondary">
              <Icon name="info" size={14} stroke={2.2} />
              <span>Different times on some days become available once you add a slot.</span>
            </p>
          )}
        </Disclosure>

        <p className="rest-note caption1 secondary">
          <span>
            {hasSlots
              ? 'Guests can only answer for these days and slots.'
              : 'Without slots, guests mark any times they like on the days above.'}
          </span>
        </p>
      </div>

      <Sheet open={sheetOpen && sheet?.kind === 'slot'} onClose={closeSheet} labelledBy={SLOT_EDITOR_TITLE}>
        {sheet?.kind === 'slot' && (
          <SlotEditor
            key={sheet.id}
            range={sheet.range}
            onClose={closeSheet}
            onSave={(range) =>
              update((current) =>
                setSlots(current, [...current.slots.filter((r) => !sheet.range || !sameRange(r, sheet.range)), range]),
              )
            }
            onDelete={() => update((current) => setSlots(current, current.slots.filter((r) => !sheet.range || !sameRange(r, sheet.range))))}
          />
        )}
      </Sheet>

      <Sheet open={sheetOpen && sheet?.kind === 'pick'} onClose={closeSheet} labelledBy={OVERRIDE_PICKER_TITLE}>
        {sheet?.kind === 'pick' && (
          <OverridePicker
            key={sheet.id}
            dates={plan.possibleDays.filter((date) => !(date in plan.overrides))}
            onClose={closeSheet}
            onPick={(date) => showSheet({ kind: 'override', date })}
          />
        )}
      </Sheet>

      <Sheet open={sheetOpen && sheet?.kind === 'override'} onClose={closeSheet} labelledBy={OVERRIDE_TITLE}>
        {sheet?.kind === 'override' && (
          <OverrideEditor
            key={sheet.id}
            date={sheet.date}
            ranges={slotsFor(plan, sheet.date)}
            defaults={plan.slots}
            overridden={sheet.date in plan.overrides}
            onClose={closeSheet}
            onSave={(ranges) => update((current) => setOverride(current, sheet.date, ranges))}
            onReset={() => update((current) => setOverride(current, sheet.date, null))}
            onRemoveDay={() => update((current) => togglePossibleDay(current, sheet.date))}
          />
        )}
      </Sheet>

    </main>
  )
}
