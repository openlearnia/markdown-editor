import { useEffect, useRef } from 'react'
import { EditorView } from '@codemirror/view'
import { createEditorState } from './createEditorState'

interface MarkdownEditorProps {
  value: string
  path: string | null
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, path, onChange }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      state: createEditorState(value, (v) => onChangeRef.current(v)),
      parent: containerRef.current,
    })
    viewRef.current = view

    return () => {
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
