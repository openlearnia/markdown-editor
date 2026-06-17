import { writeFile, createDirectory, entryExists } from './opfs'

const WELCOME_PATH = 'welcome.md'
const IDEAS_PATH = 'notes/ideas.md'

const WELCOME_CONTENT = `# Welcome to Openlearnia Markdown

Your notes live **on this device** using the browser's private file system (OPFS). No account, no server.

## Quick start

- Create files and folders from the sidebar
- Press **Ctrl+K** (or **⌘K**) to open the command palette
- Edits auto-save after a short pause
- Toggle preview with **Ctrl+\\**

## Markdown support

GitHub Flavored Markdown is supported: **bold**, *italic*, tables, task lists, and fenced code blocks.

\`\`\`js
console.log('Hello, Openlearnia!')
\`\`\`

> Your workspace persists across browser restarts until you clear site data.
`

const IDEAS_CONTENT = `# Ideas

- [ ] Sketch feature ideas here
- [ ] Link related notes in \`welcome.md\`
`

export async function seedWorkspaceIfEmpty(): Promise<boolean> {
  const hasWelcome = await entryExists(WELCOME_PATH)
  if (hasWelcome) return false

  await writeFile(WELCOME_PATH, WELCOME_CONTENT)
  await createDirectory('notes')
  await writeFile(IDEAS_PATH, IDEAS_CONTENT)

  const metaDir = '.openlearnia'
  await createDirectory(metaDir)
  await writeFile(
    `${metaDir}/meta.json`,
    JSON.stringify({ name: 'My Workspace', createdAt: new Date().toISOString() }, null, 2),
  )

  return true
}

export { WELCOME_PATH }
