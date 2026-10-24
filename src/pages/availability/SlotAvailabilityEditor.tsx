import { useState } from 'react'
import type { Availability, SlotState, TimeRange } from '../../interfaces/availability'
import type { IsoDate, Plan } from '../../interfaces/plan'
import { answerSlot, flip, normalise, rangeKey, slotState } from '../../utils/availability'
import { dayLabelLong, monthOf, monthShort, planRangeLabel, weekdayLong } from '../../utils/date'
import { endsNextDay, rangeLabel, rangeSpoken } from '../../utils/format'
import { slotsFor } from '../../utils/plan'
import { Icon } from '../../ui/Icon'
import { PageNav } from '../../ui/PageNav'
import { useToast } from '../../ui/Toast'
import { Mark } from './Mark'
import { rangeIcon } from './tone'
import './SlotAvailabilityEditor.css'

/** Each tap moves a slot one step: busy, then free, then "can be free", then busy again. */
const NEXT: Record<SlotState, SlotState> = { busy: 'free', free: 'ifNeeded', ifNeeded: 'busy' }
const LABEL: Record<SlotState, string> = { busy: 'Busy', free: 'Free', ifNeeded: 'Can be free' }

interface SlotAvailabilityEditorProps {
  plan: Plan
  initial: Availability
  onBack: () => void
  onSave: (availability: Availability) => Promise<void>
}

/** "When are you free?" for a plan whose organiser offers set time slots: guests tap a slot on each possible day. */
export function SlotAvailabilityEditor({ plan, initial, onBack, onSave }: SlotAvailabilityEditorProps) {
  // Answers are kept as free and "can be free" times; anything not answered counts as busy.
  const [availability, setAvailability] = useState(() =>
    initial.mode === 'free' ? initial : normalise(flip(initial, plan), plan),
  )
  const [saved, setSaved] = useState(availability)
  const [toast, showToast] = useToast()

  const save = async () => {
    await onSave(availability)
    setSaved(availability)
    showToast('Your times are saved')
  }
  const leave = () => (JSON.stringify(availability) === JSON.stringify(saved) || confirm('Leave without saving your times?')) && onBack()

  return (
    <main className="page">
      <PageNav onBack={leave} onDone={save} />

      <header className="page-header">
        <p className="footnote semibold secondary caps">
          {plan.name} · {planRangeLabel(plan)}
        </p>
        <h1 className="title1">When are you free?</h1>
      </header>

      <div className="page-content">
        <ul className="slot-days">
          {plan.possibleDays.map((date, i) => (
            <li key={date}>
              <DayAnswers
                plan={plan}
                showMonth={i === 0 || monthOf(date) !== monthOf(plan.possibleDays[i - 1])}
                date={date}
                availability={availability}
                onAnswer={(range, state) => setAvailability((a) => answerSlot(a, plan, date, range, state))}
              />
            </li>
          ))}
        </ul>

        <p className="rest-note caption1 secondary">
          <Icon name="info" size={14} stroke={2.2} />
          <span>
            Tap a time to change your answer. Anything you leave counts as{' '}
            <strong className="semibold" data-tone="busy">
              busy
            </strong>
          </span>
        </p>
      </div>
      {toast}
    </main>
  )
}

interface DayAnswersProps {
  plan: Plan
  /** Says the month too, on the first day of each month shown. */
  showMonth: boolean
  date: IsoDate
  availability: Availability
  onAnswer: (range: TimeRange, state: SlotState) => void
}

function DayAnswers({ plan, showMonth, date, availability, onAnswer }: DayAnswersProps) {
  return (
    <section className="card slot-day" aria-label={dayLabelLong(date)}>
      <h2 className="headline">
        {weekdayLong(date)} <span className="secondary">{Number(date.slice(8))}{showMonth && ` ${monthShort(date)}`}</span>
      </h2>
      <ul className="slot-answers">
        {slotsFor(plan, date).map((range) => {
          const state = slotState(availability, plan, date, range)
          return (
            <li key={rangeKey(range)}>
              <button
                type="button"
                className="slot-answer"
                data-tone={state === 'busy' ? undefined : state}
                data-state={state}
                aria-label={`${dayLabelLong(date)}, ${rangeSpoken(range)}: ${LABEL[state]}. Change`}
                onClick={() => onAnswer(range, NEXT[state])}
              >
                <Icon name={rangeIcon(range)} size={15} stroke={2.4} />
                <span className="slot-answer-range">
                  <span className="headline tabular">{rangeLabel(range)}</span>
                  {endsNextDay(range) && <span className="caption2 semibold secondary caps">Ends next day</span>}
                </span>
                <span className="slot-answer-state caption1 semibold">
                  {state !== 'busy' && <Mark tone={state} size={10} />}
                  {LABEL[state]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
