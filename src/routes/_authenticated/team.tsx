import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ManageMembersDialog } from '@/components/ManageMembersDialog'
import { MemberAvatar } from '@/components/MemberAvatar'
import { ProjectCard } from '@/components/ProjectCard'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthProvider'
import { sortByPriorityThenDeadline } from '@/lib/utils'
import { useProjects } from '@/stores/useProjects'
import type { Status } from '@/types'

const groups: Status[] = ['Not Started', 'Ongoing', 'Done']

export const Route = createFileRoute('/_authenticated/team')({
  head: () => ({
    meta: [{ title: 'Team — Nueva™' }],
  }),
  component: TeamRoute,
})

function TeamRoute() {
  const { isAdmin } = useAuth()
  const projects = useProjects((state) => state.projects)
  const members = useProjects((state) => state.members)
  const [selected, setSelected] = useState<string | null>(members[0] ?? null)
  const activeMember = selected ?? members[0]

  const memberProjects = useMemo(() => {
    if (!activeMember) return []
    return projects.filter((project) => project.assignedTo.includes(activeMember))
  }, [activeMember, projects])

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">My Queue</p>
          <h1 className="mt-1 text-3xl font-semibold">Team</h1>
        </div>
        {isAdmin ? <ManageMembersDialog /> : null}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {members.map((member) => (
          <Button key={member} variant={member === activeMember ? 'default' : 'secondary'} onClick={() => setSelected(member)}>
            <MemberAvatar name={member} className="size-6" />
            {member}
          </Button>
        ))}
        {members.length === 0 ? <p className="text-muted-foreground">Add team members to build queues.</p> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((status) => {
          const list = status === 'Ongoing'
            ? sortByPriorityThenDeadline(memberProjects.filter((project) => project.status === status))
            : memberProjects.filter((project) => project.status === status)
          return (
            <section key={status} className="rounded-lg border border-border bg-card/70 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{status}</h2>
                <span className="rounded-full bg-secondary px-2 py-1 text-xs">{list.length}</span>
              </div>
              <div className="grid gap-3">
                {list.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
