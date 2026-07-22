import { useState, useRef, useEffect } from 'react'
import type { TreeNode } from '../fs/types'
import { useWorkspace } from '../store/workspace'
import { flattenFiles } from '../fs/tree'
import { FileContextMenu } from './FileContextMenu'
import { ConfirmModal } from './ConfirmModal'

interface FileTreeProps {
  nodes: TreeNode[]
  depth?: number
}

function FileIcon({ kind }: { kind: TreeNode['kind'] }) {
  if (kind === 'directory') {
    return (
      <svg className="shrink-0 text-muted" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M2 4a1 1 0 0 1 1-1h3.5l1 1H13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
      </svg>
    )
  }
  return (
    <svg className="shrink-0 text-accent" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 2h5l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function TreeNodeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const activePath = useWorkspace((s) => s.activePath)
  const expandedFolders = useWorkspace((s) => s.expandedFolders)
  const openFile = useWorkspace((s) => s.openFile)
  const toggleFolder = useWorkspace((s) => s.toggleFolder)
  const renameNode = useWorkspace((s) => s.renameNode)
  const deleteNode = useWorkspace((s) => s.deleteNode)
  const createFile = useWorkspace((s) => s.createFile)
  const createFolder = useWorkspace((s) => s.createFolder)

  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  const isExpanded = expandedFolders.has(node.path)
  const isActive = activePath === node.path

  useEffect(() => {
    if (renaming) inputRef.current?.select()
  }, [renaming])

  const handleRenameSubmit = () => {
    void renameNode(node.path, renameValue).then(() => setRenaming(false))
  }

  const handleClick = () => {
    if (node.kind === 'directory') {
      void toggleFolder(node.path)
    } else {
      void openFile(node.path)
    }
  }

  return (
    <>
      <div
        className={`group relative flex items-center rounded-md text-sm transition ${
          menuOpen ? 'z-10' : ''
        } ${isActive ? 'border-l-2 border-accent bg-accent/25 text-accent' : 'border-l-2 border-transparent text-text hover:bg-surface-raised'}`}
      >
        <div
          className="flex min-w-0 flex-1 items-center gap-1 py-0.5 pr-7"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.kind === 'directory' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                void toggleFolder(node.path)
              }}
              className="shrink-0 p-0.5 text-muted hover:text-text"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={`transition ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
              >
                <path d="M4 2l4 4-4 4V2z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={handleClick}
            className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
          >
            <FileIcon kind={node.kind} />
            {renaming ? (
              <input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit()
                  if (e.key === 'Escape') setRenaming(false)
                }}
                className="min-w-0 flex-1 rounded border border-accent bg-bg px-1 py-0 font-mono text-xs text-text outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate" title={node.name}>
                {node.name}
              </span>
            )}
          </button>
        </div>
        <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          <button
            ref={menuTriggerRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((v) => !v)
            }}
            className="rounded p-1 text-muted hover:bg-border hover:text-text"
            aria-label="Actions"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            ⋯
          </button>
        </div>
        <FileContextMenu
          node={node}
          open={menuOpen}
          anchorRef={menuTriggerRef}
          onClose={() => setMenuOpen(false)}
          onNewFile={() => void createFile(node.path)}
          onNewFolder={() => void createFolder(node.path)}
          onRename={() => {
            setRenameValue(node.name)
            setRenaming(true)
          }}
          onDelete={() => setDeleteConfirmOpen(true)}
        />
        <ConfirmModal
          open={deleteConfirmOpen}
          title={`Delete "${node.name}"?`}
          description={
            node.kind === 'directory'
              ? 'This folder and everything inside it will be permanently removed from your workspace.'
              : 'This file will be permanently removed from your workspace.'
          }
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={() => {
            setDeleteConfirmOpen(false)
            void deleteNode(node.path)
          }}
        />
      </div>
      {node.kind === 'directory' && isExpanded && node.children?.map((child) => (
        <TreeNodeRow key={child.path} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  const createFile = useWorkspace((s) => s.createFile)
  const createFolder = useWorkspace((s) => s.createFolder)
  const importFiles = useWorkspace((s) => s.importFiles)
  const files = flattenFiles(nodes)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const handleImport = async (selectedFiles: FileList | File[]) => {
    try {
      const importedPaths = await importFiles(Array.from(selectedFiles))
      setImportMessage(
        importedPaths.length > 0
          ? `Imported ${importedPaths.length} Markdown ${importedPaths.length === 1 ? 'file' : 'files'}`
          : 'No Markdown files found',
      )
    } catch {
      setImportMessage('Could not import files')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">Files</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => void createFile()}
            className="rounded p-1 text-muted hover:bg-surface-raised hover:text-accent"
            title="New file"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => void createFolder()}
            className="rounded p-1 text-muted hover:bg-surface-raised hover:text-accent"
            title="New folder"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M2 4a1 1 0 0 1 1-1h3.5l1 1H13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded p-1 text-muted hover:bg-surface-raised hover:text-accent"
            title="Import Markdown files"
            aria-label="Import Markdown files"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="rounded p-1 text-muted hover:bg-surface-raised hover:text-accent"
            title="Import a Markdown folder"
            aria-label="Import a Markdown folder"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M2 4a1 1 0 0 1 1-1h3.5l1 1H13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
              <path d="M8 6v4M6 8h4" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,text/markdown"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.currentTarget.files) void handleImport(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
      <input
        ref={(element) => {
          folderInputRef.current = element
          element?.setAttribute('webkitdirectory', '')
        }}
        type="file"
        accept=".md,text/markdown"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.currentTarget.files) void handleImport(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
      <div
        className={`flex-1 overflow-auto p-2 ${isDragging ? 'bg-accent/10 ring-1 ring-inset ring-accent' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          void handleImport(event.dataTransfer.files)
        }}
      >
        {importMessage && <p className="mb-2 px-2 text-xs text-muted" role="status">{importMessage}</p>}
        {files.length === 0 && nodes.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted">Drop Markdown files here or import them above</p>
        ) : (
          nodes.map((node) => <TreeNodeRow key={node.path} node={node} depth={depth} />)
        )}
      </div>
    </div>
  )
}
