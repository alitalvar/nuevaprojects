import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Priority, Project } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const priorityRank: Record<Priority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
}

export function sortByPriorityThenDeadline(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const priority = priorityRank[a.priority] - priorityRank[b.priority]
    if (priority !== 0) return priority
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
