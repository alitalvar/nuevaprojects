import { cn, initials } from '@/lib/utils'
import { useProjects } from '@/stores/useProjects'

export function MemberAvatar({ name, className }: { name: string; className?: string }) {
  const avatar = useProjects((state) => state.memberAvatars[name])
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background bg-secondary text-xs font-semibold text-secondary-foreground',
        className,
      )}
      title={name}
    >
      {avatar ? <img src={avatar} alt={name} className="size-full object-cover" /> : initials(name)}
    </span>
  )
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.slice(0, 4).map((name) => (
        <MemberAvatar key={name} name={name} />
      ))}
      {names.length > 4 ? (
        <span className="inline-flex size-8 items-center justify-center rounded-full border border-background bg-muted text-xs">
          +{names.length - 4}
        </span>
      ) : null}
    </div>
  )
}

export function AssigneeList({ names }: { names: string[] }) {
  if (names.length === 0) return <span className="text-muted-foreground">Unassigned</span>

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {names.map((name) => (
        <span key={name} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          <MemberAvatar name={name} className="size-5 text-[0.625rem]" />
          <span className="max-w-32 truncate">{name}</span>
        </span>
      ))}
    </div>
  )
}
