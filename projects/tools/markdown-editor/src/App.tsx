import { useEffect } from 'react'
import { isOpfsSupported } from './fs/opfs'
import { useWorkspace } from './store/workspace'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useAutoSaveFlush } from './hooks/useAutoSave'
import { UnsupportedBrowser } from './components/UnsupportedBrowser'
import { AppShell } from './components/AppShell'

function App() {
  const init = useWorkspace((s) => s.init)
  const loading = useWorkspace((s) => s.loading)
  const error = useWorkspace((s) => s.error)
  const ready = useWorkspace((s) => s.ready)

  useKeyboardShortcuts()
  useAutoSaveFlush()

  useEffect(() => {
    if (isOpfsSupported()) {
      void init()
    }
  }, [init])

  if (!isOpfsSupported()) {
    return <UnsupportedBrowser />
  }

  if (loading && !ready) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm">Loading workspace…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-xl border border-danger/30 bg-surface p-6 text-center">
          <p className="text-danger font-medium">Something went wrong</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </div>
      </div>
    )
  }

  return <AppShell />
}

export default App
