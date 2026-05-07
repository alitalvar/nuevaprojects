import { useState } from 'react'
import { Camera, Trash2, UserPlus } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MemberAvatar } from '@/components/MemberAvatar'
import { useProjects } from '@/stores/useProjects'

export function ManageMembersDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const members = useProjects((state) => state.members)
  const addMember = useProjects((state) => state.addMember)
  const renameMember = useProjects((state) => state.renameMember)
  const removeMember = useProjects((state) => state.removeMember)
  const setMemberAvatar = useProjects((state) => state.setMemberAvatar)
  const removeMemberAvatar = useProjects((state) => state.removeMemberAvatar)

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Manage Team
      </Button>
      <Dialog open={open} title="Manage Team" onOpenChange={setOpen}>
        <form
          className="mb-5 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) return
            setSaving(true)
            setError('')
            void addMember(name.trim())
              .then(() => setName(''))
              .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not add member.'))
              .finally(() => setSaving(false))
          }}
        >
          <Input placeholder="Member name" value={name} onChange={(event) => setName(event.target.value)} />
          <Button type="submit" disabled={saving}>
            <UserPlus className="size-4" />
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </form>
        {error ? <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-3">
          {members.map((member) => (
            <div key={member} className="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <MemberAvatar name={member} />
              <Input
                defaultValue={member}
                onBlur={(event) => {
                  if (event.target.value === member) return
                  void renameMember(member, event.target.value).catch((caught) =>
                    setError(caught instanceof Error ? caught.message : 'Could not rename member.'),
                  )
                }}
              />
              <div className="flex gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
                  <Camera className="size-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void setMemberAvatar(member, file).catch((caught) =>
                          setError(caught instanceof Error ? caught.message : 'Could not upload avatar.'),
                        )
                      }
                    }}
                  />
                </label>
                <Button
                  aria-label="Remove avatar"
                  variant="ghost"
                  onClick={() =>
                    void removeMemberAvatar(member).catch((caught) =>
                      setError(caught instanceof Error ? caught.message : 'Could not remove avatar.'),
                    )
                  }
                >
                  <Camera className="size-4" />
                </Button>
                <Button
                  aria-label="Remove member"
                  variant="destructive"
                  onClick={() =>
                    void removeMember(member).catch((caught) =>
                      setError(caught instanceof Error ? caught.message : 'Could not remove member.'),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  )
}
