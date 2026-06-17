import { useWorkspace } from '../store/workspace'
import { downloadBlob, exportWorkspaceZip } from '../fs/export'

export function TopBar() {
  const setCommandPaletteOpen = useWorkspace((s) => s.setCommandPaletteOpen)
  const setShortcutsOpen = useWorkspace((s) => s.setShortcutsOpen)
  const previewVisible = useWorkspace((s) => s.previewVisible)
  const togglePreview = useWorkspace((s) => s.togglePreview)

  const handleExport = async () => {
    const blob = await exportWorkspaceZip()
    const stamp = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `openlearnia-markdown-${stamp}.zip`)
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        <span className="font-semibold tracking-tight">Openlearnia Markdown</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-text"
        >
          <span>Search</span>
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <button
          type="button"
          onClick={() => togglePreview()}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-text"
          title="Toggle preview"
        >
          {previewVisible ? 'Hide preview' : 'Show preview'}
        </button>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-text"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => setShortcutsOpen(true)}
          className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted transition hover:border-accent hover:text-text"
          title="Keyboard shortcuts"
        >
          ?
        </button>
      </div>
    </header>
  )
}
