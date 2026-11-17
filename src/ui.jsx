import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { statusLabel } from './data'
import { useApp } from './store'

export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function Icon({ name }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'back' && <path d="M15 5 8 12l7 7" />}
      {name === 'close' && <path d="M6 6l12 12M18 6 6 18" />}
      {name === 'plus' && <path d="M12 5v14M5 12h14" />}
      {name === 'search' && (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m16 16 4 4" />
        </>
      )}
      {name === 'sliders' && (
        <>
          <path d="M4 8h16M4 16h16" />
          <circle cx="9" cy="8" r="2" fill="white" />
          <circle cx="15" cy="16" r="2" fill="white" />
        </>
      )}
      {name === 'bell' && (
        <>
          <path d="M6 16h12l-1.2-2.2V10a4.8 4.8 0 0 0-9.6 0v3.8z" />
          <path d="M10 16a2 2 0 0 0 4 0" />
        </>
      )}
      {name === 'chevron' && <path d="m9 6 6 6-6 6" />}
      {name === 'home' && <path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />}
      {name === 'ticket' && <path d="M5 7h14v4a2 2 0 0 0 0 4v4H5v-4a2 2 0 0 0 0-4z" />}
      {name === 'pin' && (
        <>
          <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.2" />
        </>
      )}
      {name === 'houses' && <path d="m3 11 5-4 5 4V20H3zM13 20v-6l6-4 2 1.6V20z" />}
      {name === 'crew' && (
        <>
          <circle cx="9" cy="9" r="3" />
          <path d="M3.6 19a5.4 5.4 0 0 1 10.8 0" />
          <circle cx="17" cy="9.5" r="2.2" />
          <path d="M16.2 14.5a4.2 4.2 0 0 1 4.2 4" />
        </>
      )}
      {name === 'inbox' && <path d="M4 13h4l2 2h4l2-2h4v6H4zM4 13 7 5h10l3 8" />}
      {name === 'check' && <path d="m5 12.5 4.2 4.5L19 7" />}
      {name === 'send' && <path d="m4 12 16-7-7 16-2-7z" />}
      {name === 'flag' && <path d="M6 20V4m0 0h11l-2 4 2 4H6" />}
      {name === 'image' && (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="m4 16 4.5-4 3.2 3L15 12l5 4" />
        </>
      )}
      {name === 'lock' && (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      )}
      {name === 'camera' && (
        <>
          <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
          <circle cx="12" cy="13" r="3" />
        </>
      )}
      {name === 'video' && (
        <>
          <rect x="3" y="7" width="12" height="10" rx="2" />
          <path d="m15 11 6-3v8l-6-3z" />
        </>
      )}
      {name === 'drop' && <path d="M12 3s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11z" />}
      {name === 'bolt' && <path d="M13 3 5 14h6l-1 7 8-11h-6z" />}
      {name === 'brush' && <path d="m14 4 6 6-8.5 8.5H7V14z" />}
      {name === 'door' && (
        <>
          <path d="M7 20V4h9v16" />
          <path d="M14.2 12h.1" />
        </>
      )}
      {name === 'crack' && <path d="m9 3 3 6-4 2 5 5-3 5" />}
      {name === 'more' && (
        <>
          <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  )
}

export function Overlay({ children }) {
  const { phoneEl } = useApp()
  const [node] = useState(() => {
    const element = document.createElement('div')
    element.className = 'overlay-root'
    return element
  })

  useEffect(() => {
    if (!phoneEl) return undefined
    phoneEl.appendChild(node)
    return () => {
      node.remove()
    }
  }, [phoneEl, node])

  if (!phoneEl) return null
  return createPortal(children, node)
}

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <Overlay>
      <div className="backdrop" onClick={onClose}>
        <div
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="grab" />
          <div className="sheet-head">
            <h2>{title}</h2>
            <button type="button" className="iconbtn" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </Overlay>
  )
}

export function StatusPill({ status }) {
  return <span className={cx('pill', status)}>{statusLabel[status]}</span>
}
