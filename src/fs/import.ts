import { isMarkdownFile, normalizePath } from '../lib/paths'
import { writeFile } from './opfs'

function importPath(file: File): string {
  return normalizePath(file.webkitRelativePath || file.name)
}

export async function importMarkdownFiles(files: File[]): Promise<string[]> {
  const written: string[] = []

  for (const file of files) {
    if (!isMarkdownFile(file.name)) continue

    const path = importPath(file)
    if (!path) continue

    await writeFile(path, await file.text())
    written.push(path)
  }

  return written
}
