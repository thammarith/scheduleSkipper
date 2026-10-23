import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'
import './Page.css'

/** A brief confirmation. Returns where to render it and how to show a message. */
export function useToast(): [ReactNode, (text: string) => void] {
  const [toast, setToast] = useState<{ id: number; text: string }>()
  const nextId = useRef(0)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(undefined), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const node = (
    <output className="toast-region" aria-live="polite">
      {toast && (
        <span key={toast.id} className="toast">
          <Icon name="check" size={16} stroke={3} />
          <span className="footnote semibold">{toast.text}</span>
        </span>
      )}
    </output>
  )
  return [node, (text) => setToast({ id: ++nextId.current, text })]
}
