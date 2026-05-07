import { createFileRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AssigneeFilter } from '@/components/AssigneeFilter'
import { PriorityBadge, StatusBadge } from '@/components/Badges'
import { AvatarStack } from '@/components/MemberAvatar'
import { ManageMembersDialog } from '@/components/ManageMembersDialog'
import { NewProjectDialog } from '@/components/NewProjectDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthProvider'
import { sortByPriorityThenDeadline } from '@/lib/utils'
import { useProjects } from '@/stores/useProjects'
import type { Priority, Status } from '@/types'

export const Route = createFileRoute('/_authenticated/projects')({
  head: () => ({
    meta: [{ title: 'Projects — Nueva™' }],
  }),
  component: ProjectsRoute,
})

function ProjectsRoute() {
  const { isAdmin } = useAuth()
  const projects = useProjects((state) => state.projects)
  const members = useProjects((state) => state.members)
  const remove = useProjects((state) => state.remove)
  const setStatus = useProjects((state) => state.setStatus)
  const [client, setClient] = useState('')
  const [assignees, setAssignees] = useState<string[]>([])
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [status, setStatusFilter] = useState<Status | 'All'>('All')
  const [sortMode, setSortMode] = useState<'created' | 'priority'>('created')

  const filtered = useMemo(() => {
    const list = projects.filter((project) => {
      const clientMatch = !client || project.client.toLowerCase().includes(client.toLowerCase())
      const assigneeMatch = assignees.length === 0 || assignees.some((name) => project.assignedTo.includes(name))
      const priorityMatch = priority === 'All' || project.priority === priority
      const statusMatch = status === 'All' || project.status === status
      return clientMatch && assigneeMatch && priorityMatch && statusMatch
    })
    return sortMode === 'priority' ? sortByPriorityThenDeadline(list) : [...list].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }, [assignees, client, priority, projects, sortMode, status])

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Portfolio</p>
          <h1 className="mt-1 text-3xl font-semibold">Projects</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? <NewProjectDialog /> : null}
          {isAdmin ? <ManageMembersDialog /> : null}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="w-56" placeholder="Filter client" value={client} onChange={(event) => setClient(event.target.value)} />
        <AssigneeFilter members={members} selected={assignees} onChange={setAssignees} />
        <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority | 'All')}>
          {['All', 'P0', 'P1', 'P2', 'P3'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={status} onChange={(event) => setStatusFilter(event.target.value as Status | 'All')}>
          {['All', 'Not Started', 'Ongoing', 'Done'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={sortMode} onChange={(event) => setSortMode(event.target.value as 'created' | 'priority')}>
          <option value="created">Created</option>
          <option value="priority">Priority + deadline</option>
        </Select>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse bg-card text-sm">
          <thead className="bg-secondary text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Assignees</th>
              {isAdmin ? <th className="px-4 py-3 font-medium" /> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">{project.client}</td>
                <td className="max-w-xs px-4 py-3">
                  <div className="font-medium">{project.project}</div>
                  <div className="truncate text-muted-foreground">{project.description}</div>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={project.priority} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    <Select value={project.status} onChange={(event) => void setStatus(project.id, event.target.value as Status)}>
                      {['Not Started', 'Ongoing', 'Done'].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{project.deadline}</td>
                <td className="px-4 py-3">
                  <AvatarStack names={project.assignedTo} />
                </td>
                {isAdmin ? (
                  <td className="px-4 py-3 text-right">
                    <Button aria-label="Delete project" variant="ghost" onClick={() => void remove(project.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
