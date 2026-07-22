import { create } from 'zustand'
import type { SaveStatus, TreeNode } from '../fs/types'
import { getFileTree, flattenFiles } from '../fs/tree'
import {
  readFile,
  writeFile,
  createDirectory,
  deleteEntry,
  renameEntry,
  entryExists,
  getRoot,
  resolveDirectory,
} from '../fs/opfs'
import { seedWorkspaceIfEmpty, WELCOME_PATH } from '../fs/seed'
import { importMarkdownFiles } from '../fs/import'
import { loadMeta, saveMeta } from '../lib/meta'
import { joinPath, parentPath, uniqueName, baseName } from '../lib/paths'

interface WorkspaceState {
  ready: boolean
  loading: boolean
  error: string | null
  tree: TreeNode[]
  activePath: string | null
  content: string
  saveStatus: SaveStatus
  expandedFolders: Set<string>
  previewVisible: boolean
  mobileTab: 'editor' | 'preview'
  commandPaletteOpen: boolean
  shortcutsOpen: boolean

  init: () => Promise<void>
  refreshTree: () => Promise<void>
  openFile: (path: string) => Promise<void>
  setContent: (content: string) => void
  saveCurrent: () => Promise<void>
  createFile: (parentPath?: string) => Promise<string | null>
  createFolder: (parentPath?: string) => Promise<string | null>
  importFiles: (files: File[]) => Promise<string[]>
  deleteNode: (path: string) => Promise<void>
  renameNode: (oldPath: string, newName: string) => Promise<void>
  toggleFolder: (path: string) => Promise<void>
  setPreviewVisible: (visible: boolean) => void
  togglePreview: () => void
  setMobileTab: (tab: 'editor' | 'preview') => void
  setCommandPaletteOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  ready: false,
  loading: true,
  error: null,
  tree: [],
  activePath: null,
  content: '',
  saveStatus: 'idle',
  expandedFolders: new Set(),
  previewVisible: true,
  mobileTab: 'editor',
  commandPaletteOpen: false,
  shortcutsOpen: false,

  init: async () => {
    try {
      set({ loading: true, error: null })
      await seedWorkspaceIfEmpty()
      const meta = await loadMeta()
      const tree = await getFileTree()
      const files = flattenFiles(tree)
      const activePath =
        meta.lastOpenedPath && files.some((f) => f.path === meta.lastOpenedPath)
          ? meta.lastOpenedPath
          : files[0]?.path ?? WELCOME_PATH

      let content = ''
      if (activePath) {
        content = await readFile(activePath)
      }

      set({
        ready: true,
        loading: false,
        tree,
        activePath,
        content,
        saveStatus: 'saved',
        expandedFolders: new Set(meta.expandedFolders),
        previewVisible: meta.previewVisible,
        mobileTab: meta.mobileTab,
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to initialize workspace',
      })
    }
  },

  refreshTree: async () => {
    const tree = await getFileTree()
    set({ tree })
  },

  openFile: async (path: string) => {
    const { activePath, saveStatus } = get()
    if (path === activePath) return

    if (activePath && (saveStatus === 'dirty' || saveStatus === 'saving')) {
      await get().saveCurrent()
    }

    const nextContent = await readFile(path)
    await saveMeta({ lastOpenedPath: path })
    set({ activePath: path, content: nextContent, saveStatus: 'saved', mobileTab: 'editor' })
  },

  setContent: (content: string) => {
    set({ content, saveStatus: 'dirty' })
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void get().saveCurrent()
    }, 400)
  },

  saveCurrent: async () => {
    const { activePath, content, saveStatus } = get()
    if (!activePath) return
    if (saveStatus !== 'dirty' && saveStatus !== 'saving') return

    set({ saveStatus: 'saving' })
    try {
      await writeFile(activePath, content)
      set({ saveStatus: 'saved' })
    } catch {
      set({ saveStatus: 'error' })
    }
  },

  createFile: async (parent = '') => {
    const { tree, refreshTree, openFile } = get()
    const existing = new Set(flattenFiles(tree).map((f) => baseName(f.path)))
    const name = uniqueName('untitled.md', existing)
    const path = joinPath(parent, name)
    await writeFile(path, `# ${name.replace(/\.md$/i, '')}\n\n`)
    await refreshTree()
    await openFile(path)
    if (parent) {
      const expanded = new Set(get().expandedFolders)
      expanded.add(parent)
      set({ expandedFolders: expanded })
      await saveMeta({ expandedFolders: [...expanded] })
    }
    return path
  },

  createFolder: async (parent = '') => {
    const { refreshTree } = get()
    const name = 'new-folder'
    const path = joinPath(parent, name)
    let finalPath = path
    let i = 1
    while (await entryExists(finalPath)) {
      finalPath = joinPath(parent, `${name}-${i}`)
      i++
    }
    await createDirectory(finalPath)
    const expanded = new Set(get().expandedFolders)
    expanded.add(finalPath)
    if (parent) expanded.add(parent)
    set({ expandedFolders: expanded })
    await saveMeta({ expandedFolders: [...expanded] })
    await refreshTree()
    return finalPath
  },

  importFiles: async (files) => {
    const { activePath, saveStatus, refreshTree, saveCurrent } = get()
    if (activePath && (saveStatus === 'dirty' || saveStatus === 'saving')) {
      await saveCurrent()
    }

    const importedPaths = await importMarkdownFiles(files)
    if (importedPaths.length === 0) return importedPaths

    await refreshTree()
    const firstImportedPath = importedPaths[0]

    if (firstImportedPath === activePath) {
      const content = await readFile(firstImportedPath)
      await saveMeta({ lastOpenedPath: firstImportedPath })
      set({ content, saveStatus: 'saved', mobileTab: 'editor' })
    } else {
      await get().openFile(firstImportedPath)
    }

    return importedPaths
  },

  deleteNode: async (path: string) => {
    const { activePath, refreshTree } = get()
    await deleteEntry(path)
    await refreshTree()
    if (activePath === path || activePath?.startsWith(path + '/')) {
      const files = flattenFiles(get().tree)
      const next = files[0]?.path ?? null
      if (next) await get().openFile(next)
      else set({ activePath: null, content: '', saveStatus: 'idle' })
    }
  },

  renameNode: async (oldPath: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed.includes('/')) return
    const parent = parentPath(oldPath)
    const newPath = joinPath(parent, trimmed)
    if (newPath === oldPath) return

    const { activePath, refreshTree } = get()
    const isDir = !oldPath.endsWith('.md')

    if (isDir) {
      await moveDirectory(oldPath, newPath)
    } else {
      await renameEntry(oldPath, newPath)
    }

    await refreshTree()
    if (activePath === oldPath) {
      await saveMeta({ lastOpenedPath: newPath })
      set({ activePath: newPath })
    } else if (activePath?.startsWith(oldPath + '/')) {
      const updated = activePath.replace(oldPath, newPath)
      await saveMeta({ lastOpenedPath: updated })
      set({ activePath: updated })
    }
  },

  toggleFolder: async (path: string) => {
    const expanded = new Set(get().expandedFolders)
    if (expanded.has(path)) expanded.delete(path)
    else expanded.add(path)
    set({ expandedFolders: expanded })
    await saveMeta({ expandedFolders: [...expanded] })
  },

  setPreviewVisible: (visible: boolean) => {
    set({ previewVisible: visible })
    void saveMeta({ previewVisible: visible })
  },

  togglePreview: () => {
    const next = !get().previewVisible
    get().setPreviewVisible(next)
  },

  setMobileTab: (tab: 'editor' | 'preview') => {
    set({ mobileTab: tab })
    void saveMeta({ mobileTab: tab })
  },

  setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),
  setShortcutsOpen: (open: boolean) => set({ shortcutsOpen: open }),
}))

async function moveDirectory(oldPath: string, newPath: string): Promise<void> {
  const root = await getRoot()
  const oldDir = await resolveDirectory(root, oldPath)

  async function copyDir(src: FileSystemDirectoryHandle, destPath: string) {
    await createDirectory(destPath)
    for await (const [name, handle] of src.entries()) {
      const childPath = joinPath(destPath, name)
      if (handle.kind === 'directory') {
        await copyDir(handle as FileSystemDirectoryHandle, childPath)
      } else {
        const content = await readFile(joinPath(oldPath, name))
        await writeFile(childPath, content)
      }
    }
  }

  await copyDir(oldDir, newPath)
  await deleteEntry(oldPath)
}
