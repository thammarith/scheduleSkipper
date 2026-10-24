import type { Plan } from '../../interfaces/plan'
import { planRangeLabel } from '../../utils/date'

interface PlanHeaderProps {
  plan: Plan
  title: string
  /** Opens the plan's setup. Only for the plan's organiser. */
  onEdit?: () => void
}

/** The plan's name and dates over the page title, with a way to edit the plan when the person organises it. */
export function PlanHeader({ plan, title, onEdit }: PlanHeaderProps) {
  return (
    <header className="page-header">
      <p className="footnote semibold secondary caps">
        {plan.name} · {planRangeLabel(plan)}
      </p>
      <h1 className="title1">{title}</h1>
      {onEdit && plan.organiser && (
        <button type="button" className="page-edit hit footnote semibold" onClick={onEdit}>
          Edit plan
        </button>
      )}
    </header>
  )
}
