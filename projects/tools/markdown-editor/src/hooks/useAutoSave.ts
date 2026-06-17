import { useEffect } from 'react'
import { useWorkspace } from '../store/workspace'

export function useAutoSaveFlush() {
  const saveCurrent = useWorkspace((s) => s.saveCurrent)
  const saveStatus = useWorkspace((s) => s.saveStatus)

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'dirty') {
        void saveCurrent()
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [saveCurrent, saveStatus])
}
