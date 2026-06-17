import { useWorkspace } from '../store/workspace'

const SHORTCUTS = [
  { keys: 'Ctrl+K / ⌘K', action: 'Command palette' },
  { keys: 'Ctrl+S / ⌘S', action: 'Save current file' },
  { keys: 'Ctrl+\\ / ⌘\\', action: 'Toggle preview' },
  { keys: '?', action: 'Show shortcuts' },
  { keys: 'Esc', action: 'Close dialogs' },
]

export function ShortcutsOverlay() {
  const open = useWorkspace((s) => s.shortcutsOpen)
  const setOpen = useWorkspace((s) => s.setShortcutsOpen)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Keyboard shortcuts</h2>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.action} className="flex items-center justify-between text-sm">
              <span className="text-muted">{s.action}</span>
              <kbd className="rounded border border-border bg-surface-raised px-2 py-0.5 font-mono text-xs">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 w-full rounded-lg border border-border py-2 text-sm text-muted hover:border-accent hover:text-text"
        >
          Close
        </button>
      </div>
    </div>
  )
}
