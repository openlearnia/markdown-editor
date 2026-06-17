import { useWorkspace } from '../store/workspace'

export function EmptyState() {
  const createFile = useWorkspace((s) => s.createFile)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-xl border border-border bg-surface p-8 max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
            <path d="M8 10h16M8 16h12M8 22h14" stroke="#6ea8fe" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold">Your notes stay on this device</h2>
        <p className="mb-6 text-sm text-muted leading-relaxed">
          Create Markdown files stored privately in your browser. No account, no server — just write.
        </p>
        <button
          type="button"
          onClick={() => void createFile()}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-accent-dim"
        >
          Create first note
        </button>
      </div>
    </div>
  )
}
