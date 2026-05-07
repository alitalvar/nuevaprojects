import { PopoverFilter } from '@/components/ui/popover'

export function AssigneeFilter({
  members,
  selected,
  onChange,
}: {
  members: string[]
  selected: string[]
  onChange: (members: string[]) => void
}) {
  const label = selected.length ? `${selected.length} assignee${selected.length === 1 ? '' : 's'}` : 'Assignees'
  return (
    <PopoverFilter label={label}>
      <div className="grid gap-2">
        {members.map((member) => (
          <label key={member} className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={selected.includes(member)}
              onChange={(event) => {
                onChange(event.target.checked ? [...selected, member] : selected.filter((name) => name !== member))
              }}
            />
            {member}
          </label>
        ))}
        {members.length === 0 ? <p className="text-muted-foreground">No members yet.</p> : null}
      </div>
    </PopoverFilter>
  )
}
