import { useEffect, useMemo, useState } from 'react'
import { useWorkspace } from '../store/workspace'
import { flattenFiles } from '../fs/tree'

export function CommandPalette() {
  const open = useWorkspace((s) => s.commandPaletteOpen)
  const setOpen = useWorkspace((s) => s.setCommandPaletteOpen)
  const tree = useWorkspace((s) => s.tree)
  const openFile = useWorkspace((s) => s.openFile)
  const createFile = useWorkspace((s) => s.createFile)
  const togglePreview = useWorkspace((s) => s.togglePreview)

  const [query, setQuery] = useState('')

  const files = useMemo(() => flattenFiles(tree), [tree])

  const actions = useMemo(
    () => [
      { id: 'new-file', label: 'New file', run: () => void createFile() },
      { id: 'toggle-preview', label: 'Toggle preview', run: () => togglePreview() },
      ...files.map((f) => ({
        id: f.path,
        label: f.path,
        run: () => void openFile(f.path),
      })),
    ],
    [files, createFile, togglePreview, openFile],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter((a) => a.label.toLowerCase().includes(q))
  }, [actions, query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[15vh]">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files and commands…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-text outline-none placeholder:text-muted"
        />
        <ul className="max-h-72 overflow-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-2 text-sm text-muted">No results</li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-surface-raised"
                  onClick={() => {
                    item.run()
                    setOpen(false)
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
