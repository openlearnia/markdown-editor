import { useWorkspace } from '../store/workspace'
import { countWords } from '../lib/markdown'

export function StatusBar() {
  const activePath = useWorkspace((s) => s.activePath)
  const content = useWorkspace((s) => s.content)
  const saveStatus = useWorkspace((s) => s.saveStatus)

  const statusLabel = {
    idle: '',
    dirty: 'Unsaved',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Save failed',
  }[saveStatus]

  const statusColor = {
    idle: 'text-muted',
    dirty: 'text-accent',
    saving: 'text-muted',
    saved: 'text-muted',
    error: 'text-danger',
  }[saveStatus]

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-surface px-4 text-xs text-muted">
      <span className="truncate font-mono">{activePath ?? 'No file open'}</span>
      <div className="flex items-center gap-3 shrink-0">
        {activePath && <span>{countWords(content)} words</span>}
        {statusLabel && <span className={statusColor}>{statusLabel}</span>}
        <span>Markdown</span>
      </div>
    </footer>
  )
}
