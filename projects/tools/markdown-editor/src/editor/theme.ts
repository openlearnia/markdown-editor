import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'

export const openlearniaTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0f1117',
      color: '#e8eaed',
    },
    '.cm-content': {
      caretColor: '#6ea8fe',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#6ea8fe',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'rgba(110, 168, 254, 0.25) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(110, 168, 254, 0.06)',
    },
    '.cm-gutters': {
      backgroundColor: '#1a1d27',
      color: '#9aa0a6',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(110, 168, 254, 0.08)',
      color: '#e8eaed',
    },
  },
  { dark: true },
)

export const editorExtensions = [oneDark, openlearniaTheme]
