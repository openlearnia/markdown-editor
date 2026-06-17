export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
}

export function joinPath(...parts: string[]): string {
  return normalizePath(parts.filter(Boolean).join('/'))
}

export function parentPath(path: string): string {
  const normalized = normalizePath(path)
  const idx = normalized.lastIndexOf('/')
  return idx === -1 ? '' : normalized.slice(0, idx)
}

export function baseName(path: string): string {
  const normalized = normalizePath(path)
  const idx = normalized.lastIndexOf('/')
  return idx === -1 ? normalized : normalized.slice(idx + 1)
}

export function isHidden(name: string): boolean {
  return name.startsWith('.')
}

export function isMarkdownFile(name: string): boolean {
  return name.toLowerCase().endsWith('.md')
}

export function splitPath(path: string): string[] {
  return normalizePath(path).split('/').filter(Boolean)
}

export function uniqueName(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  const ext = dot > 0 ? base.slice(dot) : ''
  let i = 1
  while (existing.has(`${stem} (${i})${ext}`)) i++
  return `${stem} (${i})${ext}`
}
