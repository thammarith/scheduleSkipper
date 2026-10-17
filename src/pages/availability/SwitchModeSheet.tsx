import type { Mode } from '../../domain/availability'

export const SWITCH_TITLE = 'switch-mode-title'

interface SwitchModeProps {
  from: Mode
  to: Mode
  /** Days marked now, and days the flipped list would mark. */
  markedDays: number
  flippedDays: number
  onFlip: () => void
  onStartAgain: () => void
  onCancel: () => void
}

const days = (n: number) => (n === 1 ? 'day' : 'days')

/** The body of the action sheet shown when switching mode with times already entered. */
export function SwitchMode({ from, to, markedDays, flippedDays, onFlip, onStartAgain, onCancel }: SwitchModeProps) {
  const flipped =
    flippedDays === 0
      ? `Flipping ${markedDays === 1 ? 'it' : 'them'} leaves you with no ${to} times.`
      : `We can flip ${markedDays === 1 ? 'it' : 'them'} so the other ${flippedDays} ${days(flippedDays)} ${flippedDays === 1 ? 'becomes' : 'become'} your ${to} times.`
  return (
    <>
      <div className="action-group">
        <div className="action-header">
          <h2 className="footnote semibold secondary" id={SWITCH_TITLE}>
            Switch to {to} times?
          </h2>
          <p className="caption1 secondary">
            You’ve set {markedDays} {from} {days(markedDays)}. {flipped}
          </p>
        </div>
        <button type="button" className="action-button" onClick={onFlip}>
          Flip my times
        </button>
        <button type="button" className="action-button action-button--destructive" onClick={onStartAgain}>
          Start again
        </button>
      </div>
      <button type="button" className="action-button action-button--cancel" onClick={onCancel}>
        Cancel
      </button>
    </>
  )
}
