import { useEffect, useRef } from 'react'
import { Modal } from './Modal'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-text"
        >
          {cancelLabel}
        </button>
        <button
          ref={confirmRef}
          type="button"
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            danger
              ? 'bg-danger/15 text-danger hover:bg-danger/25'
              : 'bg-accent text-bg hover:bg-accent-dim'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
