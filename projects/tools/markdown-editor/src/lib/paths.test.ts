import { describe, it, expect } from 'vitest'
import {
  normalizePath,
  joinPath,
  parentPath,
  baseName,
  isHidden,
  isMarkdownFile,
  splitPath,
  uniqueName,
} from '../lib/paths'
import { buildTree, flattenFiles } from '../fs/tree'
import type { FileEntry } from '../fs/types'

describe('paths', () => {
  it('normalizes slashes', () => {
    expect(normalizePath('/notes/ideas.md')).toBe('notes/ideas.md')
    expect(normalizePath('notes\\ideas.md')).toBe('notes/ideas.md')
  })

  it('joins path segments', () => {
    expect(joinPath('notes', 'ideas.md')).toBe('notes/ideas.md')
    expect(joinPath('', 'welcome.md')).toBe('welcome.md')
  })

  it('gets parent and base name', () => {
    expect(parentPath('notes/ideas.md')).toBe('notes')
    expect(parentPath('welcome.md')).toBe('')
    expect(baseName('notes/ideas.md')).toBe('ideas.md')
  })

  it('detects hidden and markdown files', () => {
    expect(isHidden('.openlearnia')).toBe(true)
    expect(isHidden('notes')).toBe(false)
    expect(isMarkdownFile('readme.MD')).toBe(true)
    expect(isMarkdownFile('readme.txt')).toBe(false)
  })

  it('splits paths', () => {
    expect(splitPath('notes/ideas.md')).toEqual(['notes', 'ideas.md'])
  })

  it('generates unique names', () => {
    const existing = new Set(['note.md', 'note (1).md'])
    expect(uniqueName('note.md', existing)).toBe('note (2).md')
  })
})

describe('tree', () => {
  const entries: FileEntry[] = [
    { path: 'notes', name: 'notes', kind: 'directory' },
    { path: 'notes/ideas.md', name: 'ideas.md', kind: 'file' },
    { path: 'welcome.md', name: 'welcome.md', kind: 'file' },
  ]

  it('builds nested tree', () => {
    const tree = buildTree(entries)
    expect(tree).toHaveLength(2)
    expect(tree[0].name).toBe('notes')
    expect(tree[0].children?.[0].name).toBe('ideas.md')
    expect(tree[1].name).toBe('welcome.md')
  })

  it('flattens file nodes', () => {
    const tree = buildTree(entries)
    const files = flattenFiles(tree)
    expect(files.map((f) => f.path)).toEqual(['notes/ideas.md', 'welcome.md'])
  })
})
