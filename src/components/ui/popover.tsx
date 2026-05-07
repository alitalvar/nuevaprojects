import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PopoverFilter({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button type="button" variant="outline" onClick={() => setOpen((value) => !value)}>
        {label}
      </Button>
      {open ? (
        <div className="absolute left-0 top-11 z-30 w-64 rounded-md border border-border bg-popover p-3 text-sm shadow-xl">
          {children}
        </div>
      ) : null}
    </div>
  )
}
