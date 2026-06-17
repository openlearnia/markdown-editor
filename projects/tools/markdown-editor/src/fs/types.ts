export type FileKind = 'file' | 'directory'

export interface FileEntry {
  path: string
  name: string
  kind: FileKind
}

export interface TreeNode {
  name: string
  path: string
  kind: FileKind
  children?: TreeNode[]
}

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export interface WorkspaceMeta {
  expandedFolders: string[]
  lastOpenedPath: string | null
  previewVisible: boolean
  mobileTab: 'editor' | 'preview'
}

export const DEFAULT_META: WorkspaceMeta = {
  expandedFolders: [],
  lastOpenedPath: null,
  previewVisible: true,
  mobileTab: 'editor',
}

export const HIDDEN_PREFIX = '.'
