import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { company, createSeed, houses, ownerUser, workers } from './data'

const Ctx = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'set-role':
      return { ...state, role: action.role }
    case 'set-worker':
      return { ...state, activeWorkerId: action.id }
    case 'toast':
      return { ...state, toast: { id: action.id, text: action.text } }
    case 'clear-toast':
      return { ...state, toast: null }
    case 'reset': {
      const seed = createSeed()
      return {
        role: state.role,
        activeWorkerId: 'kumar',
        toast: { id: Date.now(), text: 'Restored.' },
        ...seed,
      }
    }
    case 'add': {
      const house = houses.find((item) => item.id === ownerUser.houseId)
      const at = new Date().toISOString()
      const ticket = {
        id: action.id,
        houseId: house.id,
        category: action.payload.category,
        room: action.payload.room,
        description: action.payload.description.trim(),
        priority: action.payload.priority,
        status: 'raised',
        workerId: null,
        ownerMedia: action.payload.media,
        proof: [],
        proofNote: '',
        createdAt: at,
        timeline: [{ at, text: `${ownerUser.name} reported this from ${house.name}.` }],
      }
      return {
        ...state,
        seq: Number(action.id.slice(2)),
        tickets: [ticket, ...state.tickets],
      }
    }
    case 'assign': {
      const worker = workers.find((item) => item.id === action.workerId)
      const at = new Date().toISOString()
      return {
        ...state,
        activeWorkerId: worker.id,
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== action.ticketId) return ticket
          if (!['raised', 'assigned'].includes(ticket.status)) return ticket
          if (ticket.workerId === worker.id && ticket.status === 'assigned') return ticket
          return {
            ...ticket,
            status: 'assigned',
            workerId: worker.id,
            timeline: [
              ...ticket.timeline,
              { at, text: `${company.head} assigned ${worker.name} (${worker.trade}).` },
            ],
          }
        }),
      }
    }
    case 'start': {
      const at = new Date().toISOString()
      return {
        ...state,
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== action.ticketId || ticket.status !== 'assigned') return ticket
          const worker = workers.find((item) => item.id === ticket.workerId)
          return {
            ...ticket,
            status: 'on_site',
            timeline: [
              ...ticket.timeline,
              { at, text: `${worker.name} reached the house and started the repair.` },
            ],
          }
        }),
      }
    }
    case 'proof': {
      if (!action.media?.length) return state
      const at = new Date().toISOString()
      return {
        ...state,
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== action.ticketId || ticket.status !== 'on_site') return ticket
          const worker = workers.find((item) => item.id === ticket.workerId)
          return {
            ...ticket,
            status: 'proof',
            proof: action.media,
            proofNote: action.note.trim(),
            timeline: [
              ...ticket.timeline,
              { at, text: `${worker.name} added a photo of the finished work.` },
            ],
          }
        }),
      }
    }
    case 'close': {
      const at = new Date().toISOString()
      return {
        ...state,
        tickets: state.tickets.map((ticket) => {
          if (ticket.id !== action.ticketId) return ticket
          if (ticket.status !== 'proof' || ticket.proof.length === 0) return ticket
          return {
            ...ticket,
            status: 'closed',
            timeline: [...ticket.timeline, { at, text: `${company.head} closed the ticket.` }],
          }
        }),
      }
    }
    default:
      return state
  }
}

function init() {
  return {
    role: null,
    activeWorkerId: 'kumar',
    toast: null,
    ...createSeed(),
  }
}

export function Store({ children }) {
  const [state, dispatch] = useReducer(reducer, null, init)
  const [stack, setStack] = useState([{ name: 'roles' }])
  const [phoneEl, setPhoneEl] = useState(null)

  useEffect(() => {
    if (!state.toast) return undefined
    const timer = setTimeout(() => dispatch({ type: 'clear-toast' }), 2600)
    return () => clearTimeout(timer)
  }, [state.toast])

  function notify(text) {
    dispatch({ type: 'toast', id: Date.now(), text })
  }

  const api = {
    state,
    stack,
    phoneEl,
    setPhoneEl,
    push(screen) {
      setStack((current) => [...current, screen])
    },
    pop() {
      setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
    },
    tab(name) {
      setStack([{ name }])
    },
    chooseRole(role) {
      dispatch({ type: 'set-role', role })
      setStack([{ name: 'home' }])
    },
    showIntro() {
      setStack([{ name: 'roles' }])
    },
    reset() {
      dispatch({ type: 'reset' })
      setStack((current) => (current.length === 1 && current[0].name === 'roles' ? current : [{ name: 'home' }]))
    },
    setWorker(id) {
      dispatch({ type: 'set-worker', id })
    },
    report(payload) {
      const id = `T-${state.seq + 1}`
      dispatch({ type: 'add', id, payload })
      setStack((current) => [...current.slice(0, -1), { name: 'ticket', ticketId: id }])
      notify('Sent.')
    },
    assign(ticketId, workerId) {
      const worker = workers.find((item) => item.id === workerId)
      dispatch({ type: 'assign', ticketId, workerId })
      notify(`Assigned to ${worker.name}.`)
    },
    start(ticketId) {
      dispatch({ type: 'start', ticketId })
      notify('On site.')
    },
    submitProof(ticketId, media, note) {
      if (!media.length) return
      dispatch({ type: 'proof', ticketId, media, note })
      notify('Photo added.')
    },
    close(ticketId) {
      dispatch({ type: 'close', ticketId })
      notify('Closed.')
    },
  }

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useApp() {
  const value = useContext(Ctx)
  if (!value) throw new Error('useApp must be used inside Store')
  return value
}
