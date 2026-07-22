import { useCallback, useEffect, useRef } from 'react'
import { Panel, Group, Separator, useDefaultLayout } from 'react-resizable-panels'
import { useWorkspace } from '../store/workspace'
import { TopBar } from './TopBar'
import { FileTree } from './FileTree'
import { StatusBar } from './StatusBar'
import { MarkdownEditor } from '../editor/MarkdownEditor'
import { MarkdownPreview } from '../preview/MarkdownPreview'
import { EmptyState } from './EmptyState'
import { CommandPalette } from './CommandPalette'
import { ShortcutsOverlay } from './ShortcutsOverlay'
import { flattenFiles } from '../fs/tree'

export function AppShell() {
  const tree = useWorkspace((s) => s.tree)
  const activePath = useWorkspace((s) => s.activePath)
  const content = useWorkspace((s) => s.content)
  const setContent = useWorkspace((s) => s.setContent)
  const previewVisible = useWorkspace((s) => s.previewVisible)
  const mobileTab = useWorkspace((s) => s.mobileTab)
  const setMobileTab = useWorkspace((s) => s.setMobileTab)
  const editorScrollerRef = useRef<HTMLElement | null>(null)
  const previewScrollerRef = useRef<HTMLDivElement | null>(null)
  const isSynchronizingRef = useRef(false)
  const releaseSyncFrameRef = useRef<number | null>(null)

  const hasFiles = flattenFiles(tree).length > 0

  const panelIds = previewVisible
    ? (['sidebar', 'editor', 'preview'] as const)
    : (['sidebar', 'editor'] as const)

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'openlearnia-markdown-layout-v2',
    panelIds: [...panelIds],
    storage: localStorage,
  })

  useEffect(() => () => {
    if (releaseSyncFrameRef.current !== null) {
      cancelAnimationFrame(releaseSyncFrameRef.current)
    }
  }, [])

  const syncScroll = useCallback((from: HTMLElement, to: HTMLElement | null) => {
    if (isSynchronizingRef.current || !to) return

    const maxFrom = from.scrollHeight - from.clientHeight
    const maxTo = to.scrollHeight - to.clientHeight
    if (maxFrom <= 0 || maxTo <= 0) return

    isSynchronizingRef.current = true
    to.scrollTop = (from.scrollTop / maxFrom) * maxTo
    if (releaseSyncFrameRef.current !== null) {
      cancelAnimationFrame(releaseSyncFrameRef.current)
    }
    releaseSyncFrameRef.current = requestAnimationFrame(() => {
      isSynchronizingRef.current = false
      releaseSyncFrameRef.current = null
    })
  }, [])

  const setEditorScroller = useCallback((element: HTMLElement | null) => {
    editorScrollerRef.current = element
  }, [])

  const setPreviewScroller = useCallback((element: HTMLDivElement | null) => {
    previewScrollerRef.current = element
  }, [])

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        {hasFiles && (
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-2 text-xs font-medium ${mobileTab === 'editor' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            >
              Editor
            </button>
            {previewVisible && (
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2 text-xs font-medium ${mobileTab === 'preview' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
              >
                Preview
              </button>
            )}
          </div>
        )}
        <div className="flex min-h-0 flex-1">
          <aside className="w-60 shrink-0 border-r border-border bg-surface">
            <FileTree nodes={tree} />
          </aside>
          <main className="min-w-0 flex-1">
            {!activePath ? (
              <EmptyState />
            ) : mobileTab === 'preview' && previewVisible ? (
              <MarkdownPreview source={content} />
            ) : (
              <MarkdownEditor value={content} path={activePath} onChange={setContent} />
            )}
          </main>
        </div>
      </div>

      <div className="hidden h-full min-h-0 flex-1 md:flex">
        <Group
          id="workspace-layout"
          orientation="horizontal"
          className="h-full w-full"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel
            id="sidebar"
            defaultSize="280px"
            minSize="240px"
            maxSize="480px"
            groupResizeBehavior="preserve-pixel-size"
            className="bg-surface"
          >
            <FileTree nodes={tree} />
          </Panel>
          <Separator className="panel-separator" />
          <Panel id="editor" defaultSize={previewVisible ? 42 : 65} minSize={25} className="min-w-0">
            {!activePath ? (
              <EmptyState />
            ) : (
              <MarkdownEditor
                value={content}
                path={activePath}
                onChange={setContent}
                onScroll={(element) => syncScroll(element, previewScrollerRef.current)}
                onScrollerReady={setEditorScroller}
              />
            )}
          </Panel>
          {previewVisible && (
            <>
              <Separator className="panel-separator" />
              <Panel id="preview" defaultSize={35} minSize={20} className="min-w-0 border-l border-border bg-bg">
                <div className="flex h-full flex-col">
                  <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted">
                    Preview
                  </div>
                  <div className="min-h-0 flex-1">
                    {activePath ? (
                      <MarkdownPreview
                        source={content}
                        onScroll={(element) => syncScroll(element, editorScrollerRef.current)}
                        onScrollerReady={setPreviewScroller}
                      />
                    ) : null}
                  </div>
                </div>
              </Panel>
            </>
          )}
        </Group>
      </div>

      <StatusBar />
      <footer className="flex h-6 shrink-0 items-center justify-between gap-3 border-t border-border bg-surface px-4 text-[10px] text-muted">
        <span>© Openlearnia</span>
        <span className="truncate">Runs locally — nothing leaves your device</span>
      </footer>
      <CommandPalette />
      <ShortcutsOverlay />
    </div>
  )
}
