import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'
import type { Member, Priority, Project, ProjectRow, Status } from '@/types'

interface ProjectInput {
  client: string
  project: string
  description: string
  date: string
  startDate: string
  deadline: string
  priority: Priority
  assignedTo: string[]
}

interface ProjectsState {
  projects: Project[]
  members: string[]
  memberAvatars: Record<string, string | null>
  memberMap: Record<string, string>
  memberUsers: Record<string, string | null>
  loaded: boolean
  loading: boolean
  load: () => Promise<void>
  add: (input: ProjectInput) => Promise<void>
  update: (id: string, input: Partial<ProjectInput & { status: Status }>) => Promise<void>
  remove: (id: string) => Promise<void>
  setStatus: (id: string, status: Status) => Promise<void>
  addMember: (name: string) => Promise<void>
  renameMember: (name: string, nextName: string) => Promise<void>
  removeMember: (name: string) => Promise<void>
  setMemberAvatar: (name: string, file: File) => Promise<void>
  removeMemberAvatar: (name: string) => Promise<void>
}

function normalizeProject(row: ProjectRow): Project {
  return {
    id: row.id,
    date: row.date,
    client: row.client,
    project: row.project,
    description: row.description ?? '',
    startDate: row.start_date,
    deadline: row.deadline,
    status: row.status as Status,
    priority: row.priority as Priority,
    assignedTo: row.project_assignees?.map((item) => item.members?.name).filter(Boolean) as string[],
    createdAt: row.created_at,
  }
}

function normalizeMembers(rows: Member[]) {
  return rows.reduce(
    (acc, member) => {
      acc.members.push(member.name)
      acc.memberAvatars[member.name] = member.avatarUrl
      acc.memberMap[member.name] = member.id
      acc.memberUsers[member.name] = member.userId
      return acc
    },
    {
      members: [] as string[],
      memberAvatars: {} as Record<string, string | null>,
      memberMap: {} as Record<string, string>,
      memberUsers: {} as Record<string, string | null>,
    },
  )
}

async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from('members').select('id,name,user_id,avatar_url').order('name')
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    userId: row.user_id,
    avatarUrl: row.avatar_url,
  }))
}

async function replaceAssignees(projectId: string, memberNames: string[], memberMap: Record<string, string>) {
  const deleted = await supabase.from('project_assignees').delete().eq('project_id', projectId)
  if (deleted.error) throw deleted.error
  const rows = memberNames
    .map((name) => memberMap[name])
    .filter(Boolean)
    .map((memberId) => ({ project_id: projectId, member_id: memberId }))
  if (rows.length > 0) {
    const { error } = await supabase.from('project_assignees').insert(rows)
    if (error) throw error
  }
}

export const useProjects = create<ProjectsState>((set, get) => ({
  projects: [],
  members: [],
  memberAvatars: {},
  memberMap: {},
  memberUsers: {},
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loading) return
    set({ loading: true })
    const [members, projects] = await Promise.all([
      fetchMembers(),
      supabase
        .from('projects')
        .select('*, project_assignees(members(id,name,avatar_url,user_id))')
        .order('created_at', { ascending: false }),
    ])
    if (projects.error) throw projects.error
    set({
      ...normalizeMembers(members),
      projects: (projects.data ?? []).map((row) => normalizeProject(row as ProjectRow)),
      loaded: true,
      loading: false,
    })
  },
  add: async (input) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        client: input.client,
        project: input.project,
        description: input.description,
        date: input.date,
        start_date: input.startDate,
        deadline: input.deadline,
        priority: input.priority,
        status: 'Not Started',
      })
      .select()
      .single()
    if (error) throw error
    await replaceAssignees(data.id, input.assignedTo, get().memberMap)
    await get().load()
  },
  update: async (id, input) => {
    const payload: Record<string, unknown> = {}
    if (input.client !== undefined) payload.client = input.client
    if (input.project !== undefined) payload.project = input.project
    if (input.description !== undefined) payload.description = input.description
    if (input.date !== undefined) payload.date = input.date
    if (input.startDate !== undefined) payload.start_date = input.startDate
    if (input.deadline !== undefined) payload.deadline = input.deadline
    if (input.priority !== undefined) payload.priority = input.priority
    if (input.status !== undefined) payload.status = input.status
    const { error } = await supabase.from('projects').update(payload).eq('id', id)
    if (error) throw error
    if (input.assignedTo) await replaceAssignees(id, input.assignedTo, get().memberMap)
    await get().load()
  },
  remove: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    set((state) => ({ projects: state.projects.filter((project) => project.id !== id) }))
  },
  setStatus: async (id, status) => {
    const { error } = await supabase.from('projects').update({ status }).eq('id', id)
    if (error) throw error
    set((state) => ({
      projects: state.projects.map((project) => (project.id === id ? { ...project, status } : project)),
    }))
  },
  addMember: async (name) => {
    const { error } = await supabase.from('members').insert({ name })
    if (error) throw error
    await get().load()
  },
  renameMember: async (name, nextName) => {
    const memberId = get().memberMap[name]
    const { error } = await supabase.from('members').update({ name: nextName }).eq('id', memberId)
    if (error) throw error
    await get().load()
  },
  removeMember: async (name) => {
    const memberId = get().memberMap[name]
    const { error } = await supabase.from('members').delete().eq('id', memberId)
    if (error) throw error
    await get().load()
  },
  setMemberAvatar: async (name, file) => {
    const memberId = get().memberMap[name]
    const extension = file.name.split('.').pop() ?? 'png'
    const path = `${memberId}/${crypto.randomUUID()}.${extension}`
    const upload = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upload.error) throw upload.error
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const { error } = await supabase.from('members').update({ avatar_url: data.publicUrl }).eq('id', memberId)
    if (error) throw error
    await get().load()
  },
  removeMemberAvatar: async (name) => {
    const memberId = get().memberMap[name]
    const { error } = await supabase.from('members').update({ avatar_url: null }).eq('id', memberId)
    if (error) throw error
    await get().load()
  },
}))
