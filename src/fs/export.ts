import { zipSync, strToU8 } from 'fflate'
import { listMarkdownPaths, readFile } from './opfs'

export async function exportWorkspaceZip(): Promise<Blob> {
  const paths = await listMarkdownPaths()
  const files: Record<string, Uint8Array> = {}

  for (const path of paths) {
    const content = await readFile(path)
    files[path] = strToU8(content)
  }

  const zipped = zipSync(files)
  return new Blob([zipped], { type: 'application/zip' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
