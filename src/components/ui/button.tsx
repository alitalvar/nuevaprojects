import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline'

const variants: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
  ghost: 'hover:bg-accent text-muted-foreground hover:text-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  outline: 'border border-border bg-transparent text-foreground hover:bg-accent',
}

export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
