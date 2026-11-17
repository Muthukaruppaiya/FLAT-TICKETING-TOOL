import { useEffect, useRef, useState } from 'react'
import { houseById, initials, workerById } from './data'
import { PersonaList, Screen } from './screens'
import { Store, useApp } from './store'
import { Icon, Sheet } from './ui'

const tabsByRole = {
  owner: [
    { name: 'home', label: 'Home', icon: 'home' },
    { name: 'tickets', label: 'Tickets', icon: 'ticket' },
    { name: 'updates', label: 'Alerts', icon: 'bell' },
    { name: 'house', label: 'House', icon: 'pin' },
  ],
  manager: [
    { name: 'home', label: 'Inbox', icon: 'inbox' },
    { name: 'houses', label: 'Houses', icon: 'houses' },
    { name: 'updates', label: 'Alerts', icon: 'bell' },
    { name: 'crew', label: 'Crew', icon: 'crew' },
  ],
  worker: [
    { name: 'home', label: 'Jobs', icon: 'ticket' },
    { name: 'updates', label: 'Alerts', icon: 'bell' },
    { name: 'history', label: 'Closed', icon: 'check' },
  ],
}

function screenKey(stack, role) {
  const path = stack
    .map((screen) => [screen.name, screen.ticketId, screen.houseId, screen.workerId].filter(Boolean).join(':'))
    .join('>')
  return `${role || 'none'}|${path}`
}

function barTitle(screen) {
  if (!screen) return ''
  if (screen.name === 'ticket') return screen.ticketId
  if (screen.name === 'raise') return 'New issue'
  if (screen.name === 'house' && screen.houseId) return houseById(screen.houseId)?.name || 'House'
  if (screen.name === 'person') return workerById(screen.workerId)?.name || 'Crew'
  return ''
}

function docTitle(screen, role) {
  if (!screen || screen.name === 'roles') return 'Start'
  if (screen.name === 'ticket') return screen.ticketId
  if (screen.name === 'raise') return 'New issue'
  if (screen.name === 'house' && screen.houseId) return houseById(screen.houseId)?.name || 'House'
  if (screen.name === 'person') return workerById(screen.workerId)?.name || 'Crew'
  if (screen.name === 'houses') return 'Houses'
  if (screen.name === 'crew') return 'Crew'
  if (screen.name === 'tickets') return 'Tickets'
  if (screen.name === 'updates') return 'Notifications'
  if (screen.name === 'history') return 'Closed jobs'
  if (screen.name === 'house') return 'Your house'
  if (role === 'manager') return 'Inbox'
  if (role === 'worker') return 'Jobs'
  return 'Home'
}

function greet(state) {
  if (state.role === 'owner') return { name: 'Arun Krishnan', mark: 'AK' }
  if (state.role === 'manager') return { name: 'Devan Iyer', mark: 'DI' }
  const worker = workerById(state.activeWorkerId)
  return { name: worker?.name || 'Crew', mark: initials(worker?.name || 'Crew') }
}

function Shell() {
  const app = useApp()
  const { stack, state, pop, tab, chooseRole, reset, setPhoneEl, push } = app
  const [switcher, setSwitcher] = useState(false)
  const top = stack[stack.length - 1]
  const onRoles = top.name === 'roles' || !state.role
  const onAlerts = top.name === 'updates'
  const hideChrome = onRoles || onAlerts
  const inner = !onRoles && stack.length > 1
  const tabs = state.role ? tabsByRole[state.role] : []
  const mid = Math.ceil(tabs.length / 2)
  const leftTabs = tabs.slice(0, mid)
  const rightTabs = tabs.slice(mid)
  const hello = greet(state)
  const firstName = hello.name.split(' ')[0]
  const previous = useRef(stack)
  const motion = stack.length > previous.current.length
    ? 'forward'
    : stack.length < previous.current.length
      ? 'back'
      : 'tab'

  useEffect(() => {
    previous.current = stack
  }, [stack])

  function onCreate() {
    if (state.role === 'owner') {
      if (top.name !== 'raise') push({ name: 'raise' })
      return
    }
    setSwitcher(true)
  }

  useEffect(() => {
    document.title = `${docTitle(top, state.role)} · Nivas`
  }, [top, state.role])

  return (
    <div className="stage">
      <div className="phone" ref={setPhoneEl}>
        {!hideChrome && <header className="topbar">
          {inner ? (
            <>
              <button type="button" className="iconbtn" onClick={pop} aria-label="Back">
                <Icon name="back" />
              </button>
              <p className="bar-title">{barTitle(top)}</p>
            </>
          ) : (
            <>
              <button type="button" className="hello plain" onClick={() => setSwitcher(true)}>
                <strong>Hello, {firstName} 👋</strong>
              </button>
              <button type="button" className="bell dark" onClick={() => tab('updates')} aria-label="Notifications">
                <Icon name="bell" />
                <span className="dot" />
              </button>
            </>
          )}
        </header>}
        <main className={hideChrome ? 'scroll bare' : `scroll enter-${motion}`} key={screenKey(stack, state.role)}>
          <Screen />
        </main>
        {!onRoles && (
          <nav className="dock" aria-label="Primary">
            <div className="dock-group">
              {leftTabs.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className="navbtn"
                  aria-current={stack[0]?.name === item.name ? 'page' : undefined}
                  onClick={() => tab(item.name)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <span className="dock-slot" aria-hidden="true" />
            <div className="dock-group">
              {rightTabs.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className="navbtn"
                  aria-current={stack[0]?.name === item.name ? 'page' : undefined}
                  onClick={() => tab(item.name)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="dock-plus"
              onClick={onCreate}
              aria-label={state.role === 'owner' ? 'Report an issue' : 'Switch'}
            >
              <Icon name="plus" />
            </button>
          </nav>
        )}
        {state.toast && (
          <div className={onRoles ? 'toast low' : 'toast'} role="status" aria-live="polite">
            {state.toast.text}
          </div>
        )}
        {switcher && (
          <Sheet title="Switch" onClose={() => setSwitcher(false)}>
            <PersonaList
              onPick={(role) => {
                chooseRole(role)
                setSwitcher(false)
              }}
            />
            <button
              type="button"
              className="btn ghost block sheet-action"
              onClick={() => {
                reset()
                setSwitcher(false)
              }}
            >
              Restore
            </button>
          </Sheet>
        )}
      </div>
    </div>
  )
}

export function App() {
  return (
    <Store>
      <Shell />
    </Store>
  )
}
