import { useEffect, useRef } from 'react'
import { EditorView } from '@codemirror/view'
import { createEditorState } from './createEditorState'

interface MarkdownEditorProps {
  value: string
  path: string | null
  onChange: (value: string) => void
  onScroll?: (element: HTMLElement) => void
  onScrollerReady?: (element: HTMLElement | null) => void
}

export function MarkdownEditor({
  value,
  path,
  onChange,
  onScroll,
  onScrollerReady,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onScrollRef = useRef(onScroll)

  useEffect(() => {
    onChangeRef.current = onChange
    onScrollRef.current = onScroll
  }, [onChange, onScroll])

  useEffect(() => {
    if (!containerRef.current) return

    const handleScroll = () => onScrollRef.current?.(view.scrollDOM)
    const view = new EditorView({
      state: createEditorState(value, (v) => onChangeRef.current(v)),
      parent: containerRef.current,
    })
    viewRef.current = view
    view.scrollDOM.addEventListener('scroll', handleScroll)
    onScrollerReady?.(view.scrollDOM)

    return () => {
      view.scrollDOM.removeEventListener('scroll', handleScroll)
      onScrollerReady?.(null)
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value, path])

  return <div ref={containerRef} className="h-full min-h-0 overflow-hidden bg-bg" />
}
