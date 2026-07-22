import { beforeEach, describe, expect, it, vi } from 'vitest'

const { writeFile } = vi.hoisted(() => ({
  writeFile: vi.fn(),
}))

vi.mock('./opfs', () => ({ writeFile }))

import { importMarkdownFiles } from './import'

function markdownFile(name: string, content: string, relativePath?: string): File {
  const file = new File([content], name, { type: 'text/markdown' })
  if (relativePath) {
    Object.defineProperty(file, 'webkitRelativePath', { value: relativePath })
  }
  return file
}

describe('importMarkdownFiles', () => {
  beforeEach(() => {
    writeFile.mockReset()
  })

  it('writes Markdown files and preserves folder-relative paths', async () => {
    const written = await importMarkdownFiles([
      markdownFile('readme.md', '# Read me', 'notes/readme.md'),
      markdownFile('todo.MD', '- [ ] Ship', 'notes/todo.MD'),
      markdownFile('ignored.txt', 'Not Markdown'),
    ])

    expect(writeFile).toHaveBeenNthCalledWith(1, 'notes/readme.md', '# Read me')
    expect(writeFile).toHaveBeenNthCalledWith(2, 'notes/todo.MD', '- [ ] Ship')
    expect(written).toEqual(['notes/readme.md', 'notes/todo.MD'])
  })
})
