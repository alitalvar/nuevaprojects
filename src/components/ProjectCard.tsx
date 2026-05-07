import { CalendarClock } from 'lucide-react'
import { PriorityBadge } from '@/components/Badges'
import { AssigneeList } from '@/components/MemberAvatar'
import { Select } from '@/components/ui/select'
import { useProjects } from '@/stores/useProjects'
import type { Project, Status } from '@/types'

const statuses: Status[] = ['Not Started', 'Ongoing', 'Done']

export function ProjectCard({ project }: { project: Project }) {
  const setStatus = useProjects((state) => state.setStatus)
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-muted-foreground">{project.client}</p>
          <h3 className="mt-1 text-base font-semibold leading-tight">{project.project}</h3>
        </div>
        <PriorityBadge priority={project.priority} />
      </div>
      <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <CalendarClock className="size-4" />
          {project.deadline}
        </span>
      </div>
      <div className="mt-3">
        <AssigneeList names={project.assignedTo} />
      </div>
      <Select className="mt-4 w-full" value={project.status} onChange={(event) => void setStatus(project.id, event.target.value as Status)}>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select>
    </article>
  )
}
