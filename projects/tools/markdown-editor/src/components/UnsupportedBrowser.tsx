export function UnsupportedBrowser() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-raised text-2xl text-accent">
          ⚠
        </div>
        <h1 className="mb-2 text-xl font-semibold">Browser not supported</h1>
        <p className="text-muted leading-relaxed">
          Openlearnia Markdown requires the Origin Private File System (OPFS). Please use a recent
          version of Chrome, Edge, Firefox, or Safari.
        </p>
      </div>
    </div>
  )
}
