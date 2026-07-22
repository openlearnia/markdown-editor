import { useEffect, useState } from 'react'
import { renderMarkdown } from '../lib/markdown'
import 'highlight.js/styles/github-dark.css'
import './prose.css'

interface MarkdownPreviewProps {
  source: string
  onScroll?: (element: HTMLElement) => void
  onScrollerReady?: (element: HTMLDivElement | null) => void
}

export function MarkdownPreview({ source, onScroll, onScrollerReady }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    let cancelled = false
    void renderMarkdown(source).then((result) => {
      if (!cancelled) setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [source])

  return (
    <div
      ref={onScrollerReady}
      onScroll={(event) => onScroll?.(event.currentTarget)}
      className="prose-preview prose prose-invert max-w-none h-full overflow-auto p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
