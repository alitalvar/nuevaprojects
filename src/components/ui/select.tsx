import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring',
        className,
      )}
      {...props}
    />
  )
}
