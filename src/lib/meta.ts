import { get, set } from 'idb-keyval'
import type { WorkspaceMeta } from '../fs/types'
import { DEFAULT_META } from '../fs/types'

const META_KEY = 'openlearnia-markdown-meta'

export async function loadMeta(): Promise<WorkspaceMeta> {
  const stored = await get<WorkspaceMeta>(META_KEY)
  return { ...DEFAULT_META, ...stored }
}

export async function saveMeta(meta: Partial<WorkspaceMeta>): Promise<WorkspaceMeta> {
  const current = await loadMeta()
  const next = { ...current, ...meta }
  await set(META_KEY, next)
  return next
}

export async function toggleExpandedFolder(path: string): Promise<string[]> {
  const meta = await loadMeta()
  const set_ = new Set(meta.expandedFolders)
  if (set_.has(path)) set_.delete(path)
  else set_.add(path)
  const expandedFolders = [...set_]
  await saveMeta({ expandedFolders })
  return expandedFolders
}
