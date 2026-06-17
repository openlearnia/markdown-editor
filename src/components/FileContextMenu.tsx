import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { TreeNode } from '../fs/types'

interface FileContextMenuProps {
  node: TreeNode
  open: boolean
  anchorRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onNewFile: () => void
  onNewFolder: () => void
  onRename: () => void
  onDelete: () => void
}

export function FileContextMenu({
  node,
  open,
  anchorRef,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      const anchor = anchorRef.current
      const menu = menuRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const menuWidth = menu?.offsetWidth ?? 140
      const menuHeight = menu?.offsetHeight ?? 160
      const padding = 8

      let left = rect.right - menuWidth
      left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding))

      let top = rect.bottom + 4
      if (top + menuHeight > window.innerHeight - padding) {
        top = Math.max(padding, rect.top - menuHeight - 4)
      }

      setPosition({ top, left })
    }

    updatePosition()
    const frame = requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} aria-hidden />
      <div
        ref={menuRef}
        role="menu"
        className="fixed z-[70] min-w-[140px] rounded-lg border border-border bg-surface-raised py-1 shadow-xl"
        style={position ? { top: position.top, left: position.left } : { top: -9999, left: -9999 }}
      >
        {node.kind === 'directory' && (
          <>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-border"
              onClick={() => {
                onClose()
                onNewFile()
              }}
            >
              New file
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-border"
              onClick={() => {
                onClose()
                onNewFolder()
              }}
            >
              New folder
            </button>
          </>
        )}
        <button
          type="button"
          role="menuitem"
          className="block w-full px-3 py-1.5 text-left text-xs hover:bg-border"
          onClick={() => {
            onClose()
            onRename()
          }}
        >
          Rename
        </button>
        <button
          type="button"
          role="menuitem"
          className="block w-full px-3 py-1.5 text-left text-xs text-danger hover:bg-border"
          onClick={() => {
            onClose()
            onDelete()
          }}
        >
          Delete
        </button>
      </div>
    </>,
    document.body,
  )
}
