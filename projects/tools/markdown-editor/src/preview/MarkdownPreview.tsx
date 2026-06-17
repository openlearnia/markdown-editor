import { useEffect, useState } from 'react'
import { renderMarkdown } from '../lib/markdown'
import 'highlight.js/styles/github-dark.css'
import './prose.css'

interface MarkdownPreviewProps {
  source: string
}

export function MarkdownPreview({ source }: MarkdownPreviewProps) {
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
      className="prose-preview prose prose-invert max-w-none h-full overflow-auto p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
