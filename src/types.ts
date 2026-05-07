export type Status = 'Not Started' | 'Ongoing' | 'Done' | 'Select'
export type Priority = 'P0' | 'P1' | 'P2' | 'P3'

export interface Member {
  id: string
  name: string
  userId: string | null
  avatarUrl: string | null
}

export interface Project {
  id: string
  date: string
  client: string
  project: string
  description: string
  startDate: string
  deadline: string
  status: Status
  priority: Priority
  assignedTo: string[]
  createdAt?: string
}

export interface ProjectRow {
  id: string
  date: string
  client: string
  project: string
  description: string | null
  start_date: string
  deadline: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  project_assignees?: Array<{
    members: {
      id: string
      name: string
      avatar_url: string | null
      user_id: string | null
    } | null
  }>
}
