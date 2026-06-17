import { joinPath, parentPath, splitPath } from '../lib/paths'

let rootHandle: FileSystemDirectoryHandle | null = null

export function isOpfsSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    typeof navigator.storage.getDirectory === 'function'
  )
}

export async function getRoot(): Promise<FileSystemDirectoryHandle> {
  if (!isOpfsSupported()) {
    throw new Error('OPFS is not supported in this browser')
  }
  if (!rootHandle) {
    rootHandle = await navigator.storage.getDirectory()
    if (navigator.storage.persist) {
      await navigator.storage.persist()
    }
  }
  return rootHandle
}

export async function resolveDirectory(
  root: FileSystemDirectoryHandle,
  path: string,
  create = false,
): Promise<FileSystemDirectoryHandle> {
  const parts = splitPath(path)
  let dir = root
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create })
  }
  return dir
}

export async function resolveFileHandle(
  root: FileSystemDirectoryHandle,
  path: string,
  create = false,
): Promise<FileSystemFileHandle> {
  const parts = splitPath(path)
  if (parts.length === 0) {
    throw new Error('Invalid file path')
  }
  const fileName = parts[parts.length - 1]
  const dirPath = parts.slice(0, -1).join('/')
  const dir = dirPath ? await resolveDirectory(root, dirPath, create) : root
  return dir.getFileHandle(fileName, { create })
}

export async function readFile(path: string): Promise<string> {
  const root = await getRoot()
  const handle = await resolveFileHandle(root, path)
  const file = await handle.getFile()
  return file.text()
}

export async function writeFile(path: string, content: string): Promise<void> {
  const root = await getRoot()
  const handle = await resolveFileHandle(root, path, true)
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function createDirectory(path: string): Promise<void> {
  const root = await getRoot()
  await resolveDirectory(root, path, true)
}

export async function deleteEntry(path: string): Promise<void> {
  const root = await getRoot()
  const parent = parentPath(path)
  const name = splitPath(path).at(-1)
  if (!name) throw new Error('Invalid path')
  const dir = parent ? await resolveDirectory(root, parent) : root
  await dir.removeEntry(name, { recursive: true })
}

export async function entryExists(path: string): Promise<boolean> {
  try {
    const root = await getRoot()
    const parts = splitPath(path)
    if (parts.length === 0) return false
    const fileName = parts[parts.length - 1]
    const dirPath = parts.slice(0, -1).join('/')
    const dir = dirPath ? await resolveDirectory(root, dirPath) : root
    await dir.getFileHandle(fileName)
    return true
  } catch {
    try {
      const root = await getRoot()
      await resolveDirectory(root, path)
      return true
    } catch {
      return false
    }
  }
}

export async function renameEntry(oldPath: string, newPath: string): Promise<void> {
  const content = await readFile(oldPath)
  await writeFile(newPath, content)
  await deleteEntry(oldPath)
}

export async function listMarkdownPaths(): Promise<string[]> {
  const root = await getRoot()
  const paths: string[] = []

  async function walk(dir: FileSystemDirectoryHandle, prefix: string) {
    for await (const [name, handle] of dir.entries()) {
      if (name.startsWith('.')) continue
      const path = joinPath(prefix, name)
      if (handle.kind === 'file' && name.toLowerCase().endsWith('.md')) {
        paths.push(path)
      } else if (handle.kind === 'directory') {
        await walk(handle as FileSystemDirectoryHandle, path)
      }
    }
  }

  await walk(root, '')
  return paths.sort()
}

/** Reset cached root — for tests only */
export function resetRootForTests(): void {
  rootHandle = null
}
