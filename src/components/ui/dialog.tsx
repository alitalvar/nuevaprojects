import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Dialog({
  open,
  title,
  children,
  onOpenChange,
  className,
}: {
  open: boolean
  title: string
  children: ReactNode
  onOpenChange: (open: boolean) => void
  className?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur">
      <section className={cn('w-full max-w-2xl rounded-lg border border-border bg-popover p-5 shadow-2xl', className)}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button aria-label="Close dialog" variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
