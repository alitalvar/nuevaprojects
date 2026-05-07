import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { AssigneeFilter } from '@/components/AssigneeFilter'
import { ManageMembersDialog } from '@/components/ManageMembersDialog'
import { NewProjectDialog } from '@/components/NewProjectDialog'
import { ProjectCard } from '@/components/ProjectCard'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthProvider'
import { sortByPriorityThenDeadline } from '@/lib/utils'
import { useProjects } from '@/stores/useProjects'
import type { Status } from '@/types'

const columns: Array<{ status: Status; className: string }> = [
  { status: 'Not Started', className: 'kanban-not-started' },
  { status: 'Ongoing', className: 'kanban-ongoing' },
  { status: 'Done', className: 'kanban-done' },
]

export const Route = createFileRoute('/_authenticated/')({
  head: () => ({
    meta: [{ title: 'NUEVA PROJECT MANAGEMENT — Nueva™' }],
  }),
  component: DashboardRoute,
})

function DashboardRoute() {
  const { isAdmin } = useAuth()
  const projects = useProjects((state) => state.projects)
  const members = useProjects((state) => state.members)
  const [assignees, setAssignees] = useState<string[]>([])
  const [status, setStatus] = useState<Status | 'All'>('All')

  const filtered = useMemo(
    () =>
      projects.filter((project) => {
        const assigneeMatch = assignees.length === 0 || assignees.some((name) => project.assignedTo.includes(name))
        const statusMatch = status === 'All' || project.status === status
        return assigneeMatch && statusMatch
      }),
    [assignees, projects, status],
  )

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Delivery board</p>
          <h1 className="mt-1 text-3xl font-semibold">NUEVA PROJECT MANAGEMENT</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <AssigneeFilter members={members} selected={assignees} onChange={setAssignees} />
          <Select value={status} onChange={(event) => setStatus(event.target.value as Status | 'All')}>
            {['All', 'Not Started', 'Ongoing', 'Done'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          {isAdmin ? <NewProjectDialog /> : null}
          {isAdmin ? <ManageMembersDialog /> : null}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnProjects = sortByPriorityThenDeadline(filtered.filter((project) => project.status === column.status))
          return (
            <section key={column.status} className={`${column.className} rounded-lg border border-border p-3`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{column.status}</h2>
                <span className="rounded-full bg-secondary px-2 py-1 text-xs">{columnProjects.length}</span>
              </div>
              <div className="grid gap-3">
                {columnProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {columnProjects.length === 0 ? <p className="rounded-md border border-border p-4 text-sm text-muted-foreground">No projects here.</p> : null}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
