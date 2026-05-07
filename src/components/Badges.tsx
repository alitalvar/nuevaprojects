import type { Priority, Status } from '@/types'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-1 text-xs font-medium',
        status === 'Done' && 'bg-success text-success-foreground',
        status === 'Ongoing' && 'bg-warning text-warning-foreground',
        status === 'Not Started' && 'bg-muted text-muted-foreground',
        status === 'Select' && 'bg-secondary text-secondary-foreground',
      )}
    >
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className="inline-flex rounded-full border border-border bg-secondary px-2 py-1 text-xs font-semibold">{priority}</span>
}
