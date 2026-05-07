import { useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useProjects } from '@/stores/useProjects'
import type { Priority } from '@/types'

export function NewProjectDialog({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const members = useProjects((state) => state.members)
  const add = useProjects((state) => state.add)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [form, setForm] = useState({
    client: '',
    project: '',
    description: '',
    date: today,
    startDate: today,
    deadline: today,
    priority: 'P2' as Priority,
    assignedTo: [] as string[],
  })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await add(form)
      setOpen(false)
      setForm({ client: '', project: '', description: '', date: today, startDate: today, deadline: today, priority: 'P2', assignedTo: [] })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button className={triggerClassName} onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New Project
      </Button>
      <Dialog open={open} title="New Project" onOpenChange={setOpen}>
        <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input required placeholder="Client" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })} />
            <Input required placeholder="Project" value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value })} />
          </div>
          <Textarea placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-4">
            <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            <Input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
            <Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}>
              {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2 rounded-md border border-border p-3">
            <p className="text-sm font-medium">Assignees</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {members.map((member) => (
                <label key={member} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={form.assignedTo.includes(member)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assignedTo: event.target.checked ? [...form.assignedTo, member] : form.assignedTo.filter((name) => name !== member),
                      })
                    }
                  />
                  {member}
                </label>
              ))}
            </div>
          </div>
          {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
