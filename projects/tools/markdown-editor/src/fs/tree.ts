import type { FileEntry, TreeNode } from './types'
import { getRoot } from './opfs'
import { isHidden, joinPath } from '../lib/paths'

function sortEntries(a: FileEntry, b: FileEntry): number {
  if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

export async function walkFiles(): Promise<FileEntry[]> {
  const root = await getRoot()
  const entries: FileEntry[] = []

  async function walk(dir: FileSystemDirectoryHandle, prefix: string) {
    for await (const [name, handle] of dir.entries()) {
      if (isHidden(name)) continue
      const path = joinPath(prefix, name)
      const kind = handle.kind === 'directory' ? 'directory' : 'file'
      entries.push({ path, name, kind })
      if (handle.kind === 'directory') {
        await walk(handle as FileSystemDirectoryHandle, path)
      }
    }
  }

  await walk(root, '')
  return entries.sort(sortEntries)
}

export function buildTree(entries: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = []
  const map = new Map<string, TreeNode>()

  const dirs = entries.filter((e) => e.kind === 'directory').sort((a, b) => a.path.localeCompare(b.path))
  const files = entries.filter((e) => e.kind === 'file').sort((a, b) => a.path.localeCompare(b.path))

  for (const dir of dirs) {
    const node: TreeNode = { name: dir.name, path: dir.path, kind: 'directory', children: [] }
    map.set(dir.path, node)
    const parentPath = dir.path.includes('/') ? dir.path.slice(0, dir.path.lastIndexOf('/')) : ''
    if (parentPath) {
      map.get(parentPath)?.children?.push(node)
    } else {
      root.push(node)
    }
  }

  for (const file of files) {
    const node: TreeNode = { name: file.name, path: file.path, kind: 'file' }
    const parentPath = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : ''
    if (parentPath) {
      map.get(parentPath)?.children?.push(node)
    } else {
      root.push(node)
    }
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    })
    nodes.forEach((n) => n.children && sortNodes(n.children))
  }
  sortNodes(root)
  return root
}

export async function getFileTree(): Promise<TreeNode[]> {
  const entries = await walkFiles()
  return buildTree(entries)
}

export function flattenFiles(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []
  const visit = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.kind === 'file') result.push(node)
      if (node.children) visit(node.children)
    }
  }
  visit(nodes)
  return result
}
