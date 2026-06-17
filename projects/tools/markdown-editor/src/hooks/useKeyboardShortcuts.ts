import { useEffect } from 'react'
import { useWorkspace } from '../store/workspace'

export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useWorkspace((s) => s.setCommandPaletteOpen)
  const setShortcutsOpen = useWorkspace((s) => s.setShortcutsOpen)
  const togglePreview = useWorkspace((s) => s.togglePreview)
  const saveCurrent = useWorkspace((s) => s.saveCurrent)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void saveCurrent()
        return
      }

      if (mod && e.key === '\\') {
        e.preventDefault()
        togglePreview()
        return
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
        e.preventDefault()
        setShortcutsOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setCommandPaletteOpen, setShortcutsOpen, togglePreview, saveCurrent])
}
