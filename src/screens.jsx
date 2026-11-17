import { useRef, useState } from 'react'
import {
  ago,
  categories,
  categoryById,
  company,
  formatWhen,
  houseById,
  houses,
  initials,
  ownerUser,
  projects,
  rooms,
  samplePhoto,
  sampleShot,
  sortTickets,
  statusLabel,
  workerById,
  workers,
} from './data'
import { useApp } from './store'
import { cx, Icon, Overlay, Sheet, StatusPill } from './ui'

function rid() {
  return Math.random().toString(36).slice(2, 9)
}

export function Screen() {
  const { stack, state } = useApp()
  const top = stack[stack.length - 1]
  if (!state.role || top.name === 'roles') return <RoleScreen />
  if (top.name === 'ticket') return <TicketScreen id={top.ticketId} />
  if (top.name === 'raise') return <RaiseScreen />
  if (top.name === 'house' && top.houseId) return <HouseDetail id={top.houseId} />
  if (top.name === 'person') return <PersonScreen id={top.workerId} />
  if (top.name === 'updates') return <UpdatesScreen />
  if (state.role === 'owner' && top.name === 'tickets') return <OwnerTickets />
  if (state.role === 'owner' && top.name === 'house') return <OwnerHouse />
  if (state.role === 'manager' && top.name === 'houses') return <HousesScreen />
  if (state.role === 'manager' && top.name === 'crew') return <CrewScreen />
  if (state.role === 'worker' && top.name === 'history') return <HistoryScreen />
  if (state.role === 'manager') return <ManagerHome />
  if (state.role === 'worker') return <WorkerHome />
  return <OwnerHome />
}

export function PersonaList({ onPick }) {
  const { state } = useApp()
  const openAll = state.tickets.filter((ticket) => ticket.status !== 'closed').length
  const openMine = state.tickets.filter((ticket) => ticket.houseId === ownerUser.houseId && ticket.status !== 'closed').length
  const worker = workerById(state.activeWorkerId)
  const jobs = state.tickets.filter((ticket) => ticket.workerId === state.activeWorkerId && ticket.status !== 'closed').length

  return (
    <div className="stack">
      <button type="button" className="persona" onClick={() => onPick('owner')}>
        <span className="avatar clay">AK</span>
        <span>
          <strong>Arun Krishnan</strong>
          <small>House owner · Villa 07 · {openMine} open</small>
        </span>
        <Icon name="chevron" />
      </button>
      <button type="button" className="persona" onClick={() => onPick('manager')}>
        <span className="avatar ink">DI</span>
        <span>
          <strong>Devan Iyer</strong>
          <small>Site office · {houses.length} houses · {openAll} open</small>
        </span>
        <Icon name="chevron" />
      </button>
      <button type="button" className="persona" onClick={() => onPick('worker')}>
        <span className="avatar pine">{initials(worker.name)}</span>
        <span>
          <strong>{worker.name}</strong>
          <small>Field crew · {worker.trade} · {jobs} open {jobs === 1 ? 'job' : 'jobs'}</small>
        </span>
        <Icon name="chevron" />
      </button>
    </div>
  )
}

function RoleScreen() {
  const { chooseRole, reset } = useApp()
  return (
    <div className="gate">
      <header className="gate-brand">
        <span className="mark lg">N</span>
        <div>
          <h1>Nivas</h1>
          <p>{company.name}</p>
        </div>
      </header>
      <PersonaList onPick={chooseRole} />
      <button type="button" className="linkish light" onClick={reset}>Restore</button>
    </div>
  )
}

function ReportButton() {
  const { push } = useApp()
  const house = houseById(ownerUser.houseId)
  return (
    <button type="button" className="report" onClick={() => push({ name: 'raise' })}>
      <span className="report-copy">
        <strong>Report an issue</strong>
        <small>{house.name} · {house.project}</small>
        <span className="report-cta"><Icon name="plus" /> New ticket</span>
      </span>
      <img src={samplePhoto('villa')} alt="" />
    </button>
  )
}

function SearchRow({ query, setQuery, placeholder = 'Search...' }) {
  return (
    <label className="search solo">
      <Icon name="search" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label="Search" />
    </label>
  )
}

function UpdatesScreen() {
  const { state, push, tab } = useApp()
  const mine = state.tickets.filter((ticket) => {
    if (state.role === 'owner') return ticket.houseId === ownerUser.houseId
    if (state.role === 'worker') return ticket.workerId === state.activeWorkerId
    return true
  })
  const events = mine
    .flatMap((ticket) => ticket.timeline.map((event) => ({ ...event, ticket })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
  return (
    <div className="notify">
      <header className="notify-head">
        <button type="button" className="iconbtn light" onClick={() => tab('home')} aria-label="Back">
          <Icon name="back" />
        </button>
        <p className="kicker">See what&apos;s up</p>
        <h1>Notifications</h1>
      </header>
      <div className="notify-sheet">
        {events.length === 0 ? <p className="empty">No updates</p> : (
          <div className="notify-list">
            {events.map((event) => {
              const house = houseById(event.ticket.houseId)
              const category = categoryById(event.ticket.category)
              return (
                <button
                  type="button"
                  key={`${event.ticket.id}-${event.at}`}
                  className="notify-item"
                  onClick={() => push({ name: 'ticket', ticketId: event.ticket.id })}
                >
                  <span className="notify-ico">
                    <Icon name={category?.icon || 'bell'} />
                    <span className="notify-badge"><Icon name="chevron" /></span>
                  </span>
                  <span className="notify-copy">
                    <strong>{event.text}</strong>
                    <small>{house?.name} · {event.ticket.room}</small>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function OwnerHome() {
  const house = houseById(ownerUser.houseId)
  const { state, push, tab } = useApp()
  const [query, setQuery] = useState('')
  const open = sortTickets(state.tickets.filter((ticket) => {
    if (ticket.houseId !== house.id || ticket.status === 'closed') return false
    if (query.trim()) {
      const hay = `${ticket.room} ${ticket.id} ${categoryById(ticket.category)?.label || ''}`.toLowerCase()
      if (!hay.includes(query.trim().toLowerCase())) return false
    }
    return true
  }))
  const featured = open[0]
  const featuredCat = featured ? categoryById(featured.category) : null
  return (
    <div className="page home dash">
      <SearchRow query={query} setQuery={setQuery} placeholder="Search tickets, rooms..." />
      <div className="feature-row">
        <button type="button" className="feature dark" onClick={() => push({ name: 'raise' })}>
          <strong>Report an issue</strong>
          <span className="feature-foot">
            <span className="tag-pill">Now</span>
            <span className="play"><Icon name="plus" /></span>
          </span>
        </button>
        <button
          type="button"
          className="feature light"
          onClick={() => (featured ? push({ name: 'ticket', ticketId: featured.id }) : tab('tickets'))}
        >
          <strong>{featured ? featured.room : 'Your house'}</strong>
          <span className="feature-foot">
            <span className="tag-pill">{featured ? statusLabel[featured.status] : house.name}</span>
            <span className="play"><Icon name={featuredCat?.icon || 'home'} /></span>
          </span>
        </button>
      </div>
      <section>
        <div className="section-head">
          <h2>Open for you</h2>
          <button type="button" className="seeall" onClick={() => tab('tickets')}>See all</button>
        </div>
        {open.length === 0 ? <p className="empty">No open tickets</p> : (
          <div className="special-list">
            {open.map((ticket) => {
              const category = categoryById(ticket.category)
              return (
                <button
                  type="button"
                  key={ticket.id}
                  className={cx('special', ticket.priority === 'urgent' && 'hot')}
                  onClick={() => push({ name: 'ticket', ticketId: ticket.id })}
                >
                  <span>
                    <strong>{ticket.room}</strong>
                    <span className="tags">
                      <span className="tag-pill">{ago(ticket.createdAt)}</span>
                      <span className="tag-pill">{category?.label}</span>
                    </span>
                  </span>
                  <span className="play soft"><Icon name="chevron" /></span>
                </button>
              )
            })}
          </div>
        )}
      </section>
      <div className="cats soft">
        {categories.slice(0, 5).map((item) => (
          <button type="button" key={item.id} className="cat square" onClick={() => push({ name: 'raise' })}>
            <span className="cat-ico"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function OwnerTickets() {
  const { state } = useApp()
  const [filter, setFilter] = useState('open')
  const mine = sortTickets(state.tickets.filter((ticket) => ticket.houseId === ownerUser.houseId))
  const shown = mine.filter((ticket) => (filter === 'open' ? ticket.status !== 'closed' : ticket.status === 'closed'))
  return (
    <div className="page home">
      <header className="hero slim">
        <h1>Tickets</h1>
        <div className="hero-meta">
          <span><strong>{mine.length}</strong> total</span>
        </div>
      </header>
      <ReportButton />
      <div className="scroller">
        <button type="button" className="chip" aria-pressed={filter === 'open'} onClick={() => setFilter('open')}><Icon name="ticket" /> Open</button>
        <button type="button" className="chip" aria-pressed={filter === 'closed'} onClick={() => setFilter('closed')}><Icon name="check" /> Closed</button>
      </div>
      {shown.length === 0 ? <p className="empty">No tickets</p> : <TicketList tickets={shown} />}
    </div>
  )
}

function OwnerHouse() {
  const house = houseById(ownerUser.houseId)
  const { state } = useApp()
  const open = state.tickets.filter((ticket) => ticket.houseId === house.id && ticket.status !== 'closed').length
  return (
    <div className="page home">
      <header className="cover">
        <img src={samplePhoto('villa')} alt="" />
        <div className="cover-shade">
          <p className="kicker">{house.project}</p>
          <h1>{house.name}</h1>
          <p>{house.address}</p>
        </div>
      </header>
      <div className="statgrid house-stats">
        <div className="stat"><strong>{open}</strong><span>Open</span></div>
        <div className="stat"><strong>{house.handed.split(' ')[1] || house.handed}</strong><span>Handed</span></div>
      </div>
      <div className="card person glass">
        <span className="avatar ink">{initials(company.head)}</span>
        <div>
          <strong>{company.head}</strong>
          <p className="meta">{company.title}</p>
          <p className="meta">{company.phone}</p>
        </div>
      </div>
    </div>
  )
}

function ManagerHome() {
  const { state } = useApp()
  const [statusFilter, setStatusFilter] = useState('open')
  const [project, setProject] = useState('all')
  const counts = {
    open: state.tickets.filter((ticket) => ticket.status !== 'closed').length,
    raised: state.tickets.filter((ticket) => ticket.status === 'raised').length,
    on_site: state.tickets.filter((ticket) => ticket.status === 'on_site').length,
    proof: state.tickets.filter((ticket) => ticket.status === 'proof').length,
    closed: state.tickets.filter((ticket) => ticket.status === 'closed').length,
  }
  const shown = sortTickets(state.tickets.filter((ticket) => {
    if (statusFilter === 'open' && ticket.status === 'closed') return false
    if (statusFilter !== 'open' && ticket.status !== statusFilter) return false
    if (project !== 'all' && houseById(ticket.houseId).project !== project) return false
    return true
  }))
  const filters = [
    ['open', `Open ${counts.open}`],
    ['raised', `New ${counts.raised}`],
    ['on_site', `On site ${counts.on_site}`],
    ['proof', `Ready ${counts.proof}`],
    ['closed', `Closed ${counts.closed}`],
  ]
  const statLabel = { open: 'Open', raised: 'New', on_site: 'Site', proof: 'Ready', closed: 'Closed' }
  return (
    <div className="page home">
      <header className="hero">
        <p className="kicker">{company.name}</p>
        <h1>Inbox</h1>
        <div className="statgrid">
          {filters.map(([id]) => (
            <button type="button" key={id} className="stat" aria-pressed={statusFilter === id} onClick={() => setStatusFilter(id)}>
              <strong>{counts[id]}</strong>
              <span>{statLabel[id]}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="scroller">
        <button type="button" className="chip" aria-pressed={project === 'all'} onClick={() => setProject('all')}>All projects</button>
        {projects.map((item) => (
          <button type="button" key={item} className="chip" aria-pressed={project === item} onClick={() => setProject(item)}>
            {item}
          </button>
        ))}
      </div>
      {shown.length === 0 ? <p className="empty">No tickets</p> : <TicketList tickets={shown} />}
    </div>
  )
}

function HousesScreen() {
  const { state, push } = useApp()
  return (
    <div className="page home">
      <header className="hero slim">
        <h1>Houses</h1>
        <div className="hero-meta"><span><strong>{houses.length}</strong> homes</span></div>
      </header>
      {projects.map((project) => (
        <section key={project}>
          <h2 className="group">{project}</h2>
          <div className="stack">
            {houses.filter((house) => house.project === project).map((house) => {
              const open = state.tickets.filter((ticket) => ticket.houseId === house.id && ticket.status !== 'closed').length
              return (
                <button type="button" key={house.id} className="linkcard" data-project={project} onClick={() => push({ name: 'house', houseId: house.id })}>
                  <span>
                    <strong>{house.name}</strong>
                    <small>{house.owner}</small>
                  </span>
                  <span className={cx('count', open === 0 && 'zero')}>{open === 0 ? 'Clear' : open}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function HouseDetail({ id }) {
  const house = houseById(id)
  const { state } = useApp()
  const list = sortTickets(state.tickets.filter((ticket) => ticket.houseId === id))
  if (!house) return <p className="empty">Not found</p>
  return (
    <div className="page home">
      <header className="hero">
        <p className="kicker">{house.project}</p>
        <h1>{house.name}</h1>
        <p>{house.owner}</p>
        <div className="hero-meta">
          <span>{house.handed}</span>
        </div>
      </header>
      <div className="card">
        <p>{house.address}</p>
      </div>
      <section>
        <h2>Tickets</h2>
        {list.length === 0 ? <p className="empty">No tickets</p> : <TicketList tickets={list} />}
      </section>
    </div>
  )
}

function CrewScreen() {
  const { state, push } = useApp()
  return (
    <div className="page home">
      <header className="hero slim">
        <h1>Crew</h1>
        <div className="hero-meta"><span><strong>{workers.length}</strong> people</span></div>
      </header>
      <div className="stack">
        {workers.map((worker) => {
          const open = state.tickets.filter((ticket) => ticket.workerId === worker.id && ticket.status !== 'closed').length
          return (
            <button type="button" key={worker.id} className="linkcard" onClick={() => push({ name: 'person', workerId: worker.id })}>
              <span className="person-inline">
                <span className="avatar">{initials(worker.name)}</span>
                <span>
                  <strong>{worker.name}</strong>
                  <small>{worker.trade}</small>
                </span>
              </span>
              <span className={cx('count', open === 0 && 'zero')}>{open}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PersonScreen({ id }) {
  const worker = workerById(id)
  const { state } = useApp()
  if (!worker) return <p className="empty">Not found</p>
  const list = sortTickets(state.tickets.filter((ticket) => ticket.workerId === id))
  return (
    <div className="page home">
      <header className="hero slim">
        <p className="kicker">{worker.trade}</p>
        <h1>{worker.name}</h1>
        <div className="hero-meta"><span>{worker.phone}</span></div>
      </header>
      <section>
        <h2>Tickets</h2>
        {list.length === 0 ? <p className="empty">No tickets</p> : <TicketList tickets={list} />}
      </section>
    </div>
  )
}

function WorkerBanner() {
  const { state, setWorker } = useApp()
  const worker = workerById(state.activeWorkerId)
  return (
    <div className="who-row" aria-label="Crew">
      {workers.map((item) => (
        <button
          type="button"
          key={item.id}
          className="who"
          aria-pressed={item.id === worker.id}
          onClick={() => setWorker(item.id)}
        >
          <span className="avatar">{initials(item.name)}</span>
          <span>{item.name.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  )
}

function WorkerHome() {
  const { state } = useApp()
  const worker = workerById(state.activeWorkerId)
  const jobs = sortTickets(state.tickets.filter((ticket) => ticket.workerId === worker.id && ticket.status !== 'closed'))
  return (
    <div className="page home">
      <header className="hero slim">
        <p className="kicker">{worker.trade}</p>
        <h1>{worker.name}</h1>
        <div className="hero-meta"><span><strong>{jobs.length}</strong> jobs</span></div>
      </header>
      <WorkerBanner />
      {jobs.length === 0 ? <p className="empty">No jobs</p> : <TicketList tickets={jobs} />}
    </div>
  )
}

function HistoryScreen() {
  const { state } = useApp()
  const worker = workerById(state.activeWorkerId)
  const done = sortTickets(state.tickets.filter((ticket) => ticket.workerId === worker.id && ticket.status === 'closed'))
  return (
    <div className="page home">
      <header className="hero slim">
        <h1>Closed</h1>
        <div className="hero-meta"><span><strong>{done.length}</strong> done</span></div>
      </header>
      <WorkerBanner />
      {done.length === 0 ? <p className="empty">No jobs</p> : <TicketList tickets={done} />}
    </div>
  )
}

function TicketList({ tickets }) {
  return (
    <div className="stack">
      {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
    </div>
  )
}

function TicketCard({ ticket }) {
  const { push } = useApp()
  const house = houseById(ticket.houseId)
  const category = categoryById(ticket.category)
  const worker = workerById(ticket.workerId)
  const thumb = ticket.ownerMedia[0]
  return (
    <button
      type="button"
      className={cx('ticket-card', ticket.priority === 'urgent' && 'urgent')}
      onClick={() => push({ name: 'ticket', ticketId: ticket.id })}
    >
      <span className="thumb">
        {thumb ? <img src={thumb.url} alt="" /> : null}
        <span className="thumb-pills">
          <StatusPill status={ticket.status} />
          {ticket.priority === 'urgent' && <span className="pill hot">Urgent</span>}
        </span>
        <span className="thumb-id">{ticket.id}</span>
      </span>
      <span className="min">
        <span className="between">
          <strong>{ticket.room}</strong>
          <span className="ico sm"><Icon name={category?.icon || 'more'} /></span>
        </span>
        <span className="meta">{category?.label} · {house.name}</span>
        <span className="meta">{worker ? worker.name : 'Unassigned'} · {ago(ticket.createdAt)}</span>
      </span>
    </button>
  )
}

function MediaGrid({ items, onRemove, onZoom }) {
  if (!items.length) return null
  return (
    <div className="media-grid">
      {items.map((item) => (
        <div className="media-tile" key={item.id}>
          {item.kind === 'video' ? (
            <video src={item.url} controls playsInline preload="metadata" />
          ) : (
            <button type="button" className="zoomhit" onClick={() => onZoom?.(item.url)} aria-label={`View ${item.name}`}>
              <img src={item.url} alt={item.name} />
            </button>
          )}
          {item.kind === 'video' && <span className="badge">Video</span>}
          {onRemove && (
            <button type="button" className="x" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function MediaView({ items, empty }) {
  const [zoom, setZoom] = useState(null)
  if (!items.length) return <p className="empty">{empty}</p>
  return (
    <>
      <MediaGrid items={items} onZoom={setZoom} />
      {zoom && (
        <Overlay>
          <div className="lightbox" onClick={() => setZoom(null)} role="dialog" aria-label="Photo">
            <button type="button" className="iconbtn on-dark" onClick={() => setZoom(null)} aria-label="Close photo">
              <Icon name="close" />
            </button>
            <img src={zoom} alt="" onClick={(event) => event.stopPropagation()} />
          </div>
        </Overlay>
      )}
    </>
  )
}

function MediaPicker({ media, setMedia, sample }) {
  const inputRef = useRef(null)
  const full = media.length >= 4

  function pick(accept) {
    inputRef.current.accept = accept
    inputRef.current.click()
  }

  function onFiles(event) {
    const files = [...(event.target.files || [])]
    event.target.value = ''
    setMedia((current) => {
      const space = 4 - current.length
      const next = files.slice(0, space).map((file) => ({
        id: rid(),
        kind: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name,
        url: URL.createObjectURL(file),
      }))
      return [...current, ...next]
    })
  }

  function addSample() {
    setMedia((current) => (
      current.length >= 4
        ? current
        : [...current, { id: rid(), kind: 'image', name: sample.title, url: sampleShot(sample) }]
    ))
  }

  function remove(id) {
    setMedia((current) => {
      const item = current.find((entry) => entry.id === id)
      if (item?.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
      return current.filter((entry) => entry.id !== id)
    })
  }

  return (
    <div className="stack">
      <MediaGrid items={media} onRemove={remove} />
      <div className="split">
        <button type="button" className="well" onClick={() => pick('image/*')} disabled={full}>
          <Icon name="camera" />
          <span>Add photo</span>
        </button>
        <button type="button" className="well" onClick={() => pick('video/*')} disabled={full}>
          <Icon name="video" />
          <span>Add video</span>
        </button>
      </div>
      <button type="button" className="btn ghost block" onClick={addSample} disabled={full}><Icon name="image" /> Sample photo</button>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
    </div>
  )
}

function RaiseScreen() {
  const { report } = useApp()
  const house = houseById(ownerUser.houseId)
  const [category, setCategory] = useState('')
  const [room, setRoom] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [media, setMedia] = useState([])
  const [errors, setErrors] = useState({})
  const lock = useRef(false)
  const categoryMeta = categoryById(category)

  function submit(event) {
    event.preventDefault()
    const next = {}
    if (!category) next.category = 'Choose one.'
    if (!room) next.room = 'Choose one.'
    if (description.trim().length < 12) next.description = 'Add a few words.'
    if (!media.length) next.media = 'Add a photo or video.'
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => {
        document.querySelector('.error')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return
    }
    if (lock.current) return
    lock.current = true
    report({ category, room, description, priority, media })
  }

  return (
    <form className="page home" onSubmit={submit} noValidate>
      <header className="hero slim">
        <p className="kicker">{house.name}</p>
        <h1>{house.owner}</h1>
      </header>

      <section>
        <h2>What is wrong</h2>
        <div className="tilegrid">
          {categories.map((item) => (
            <button
              type="button"
              key={item.id}
              className="tile"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              <span className="ico"><Icon name={item.icon} /></span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        {errors.category && <p className="error">{errors.category}</p>}
      </section>

      <section>
        <h2>Where in the house</h2>
        <div className="chips">
          {rooms.map((item) => (
            <button type="button" key={item} className="chip" aria-pressed={room === item} onClick={() => setRoom(item)}>
              {item}
            </button>
          ))}
        </div>
        {errors.room && <p className="error">{errors.room}</p>}
      </section>

      <label className="field">
        <span>What happened</span>
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {errors.description && <p className="error">{errors.description}</p>}
      </label>

      <section>
        <h2>Photo or video</h2>
        <MediaPicker
          media={media}
          setMedia={setMedia}
          sample={{
            title: room || 'House',
            caption: categoryMeta?.label || 'Issue',
            tone: category === 'electrical' ? 'spark' : category === 'paint' ? 'paint' : category === 'cracks' ? 'crack' : category === 'carpentry' ? 'wood' : 'water',
          }}
        />
        {errors.media && <p className="error">{errors.media}</p>}
      </section>

      <section>
        <h2>How urgent</h2>
        <div className="split">
          <button type="button" className="tile" aria-pressed={priority === 'normal'} onClick={() => setPriority('normal')}>
            <Icon name="check" />
            <span>Can wait</span>
          </button>
          <button type="button" className="tile" aria-pressed={priority === 'urgent'} onClick={() => setPriority('urgent')}>
            <Icon name="bolt" />
            <span>Urgent</span>
          </button>
        </div>
      </section>

      <button type="submit" className="btn primary block"><Icon name="send" /> Send to the site office</button>
    </form>
  )
}

function suggestedWorker(ticket, tickets) {
  const category = categoryById(ticket.category)
  const load = (id) => tickets.filter((item) => item.workerId === id && item.status !== 'closed').length
  const pool = workers.filter((worker) => worker.trade === category?.trade)
  const list = (pool.length ? pool : workers).slice().sort((a, b) => load(a.id) - load(b.id))
  return list[0]
}

function Activity({ ticket }) {
  return (
    <ol className="rail">
      {ticket.timeline.map((event, index) => (
        <li key={`${event.at}-${index}`}>
          <span className="dot" />
          <div>
            <p>{event.text}</p>
            <time dateTime={event.at}>{formatWhen(event.at)}</time>
          </div>
        </li>
      ))}
    </ol>
  )
}

function TicketScreen({ id }) {
  const { state, assign, start, submitProof, close } = useApp()
  const ticket = state.tickets.find((item) => item.id === id)
  const [assignOpen, setAssignOpen] = useState(false)
  const [picked, setPicked] = useState(null)
  const [closeOpen, setCloseOpen] = useState(false)
  const [proofMedia, setProofMedia] = useState([])
  const [note, setNote] = useState('')
  const [proofError, setProofError] = useState('')

  if (!ticket) return <p className="empty">Not found</p>

  const house = houseById(ticket.houseId)
  const category = categoryById(ticket.category)
  const worker = workerById(ticket.workerId)
  const isWorker = state.role === 'worker' && ticket.workerId === state.activeWorkerId
  const suggested = suggestedWorker(ticket, state.tickets)
  const load = (workerId) => state.tickets.filter((item) => item.workerId === workerId && item.status !== 'closed').length
  const ordered = [...workers].sort((a, b) => {
    if (a.id === suggested.id) return -1
    if (b.id === suggested.id) return 1
    return load(a.id) - load(b.id)
  })

  function sendProof(event) {
    event.preventDefault()
    if (!proofMedia.length) {
      setProofError('Add a photo.')
      return
    }
    submitProof(ticket.id, proofMedia, note)
  }

  const cover = ticket.ownerMedia[0]
  return (
    <div className="page ticket">
      <header className="banner">
        {cover && <img src={cover.url} alt="" />}
        <div className="banner-shade">
          <div className="row">
            <StatusPill status={ticket.status} />
            {ticket.priority === 'urgent' && <span className="pill hot">Urgent</span>}
          </div>
          <h1>{ticket.room}</h1>
          <p>{category?.label} · {house.name}</p>
        </div>
      </header>

      <div className="card">
        <p className="body">{ticket.description}</p>
        <p className="meta">{house.owner}</p>
        <p className="meta">{house.address}</p>
      </div>

      {ticket.ownerMedia.length > 1 && (
        <section>
          <h2>Photos</h2>
          <MediaView items={ticket.ownerMedia} />
        </section>
      )}

      <section>
        <h2>Worker</h2>
        {worker ? (
          <div className="card person">
            <span className="avatar">{initials(worker.name)}</span>
            <div>
              <strong>{worker.name}</strong>
              <p className="meta">{worker.trade} · {worker.phone}</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <p>Unassigned</p>
          </div>
        )}
        {state.role === 'manager' && ['raised', 'assigned'].includes(ticket.status) && (
          <button
            type="button"
            className="btn primary block"
            onClick={() => {
              setPicked(worker?.id || suggested.id)
              setAssignOpen(true)
            }}
          >
            <Icon name="crew" /> {worker ? 'Change worker' : 'Assign a worker'}
          </button>
        )}
      </section>

      {ticket.proof.length > 0 && (
        <section>
          <h2>After</h2>
          {ticket.proofNote ? <p className="body">{ticket.proofNote}</p> : null}
          <MediaView items={ticket.proof} />
        </section>
      )}

      {isWorker && ticket.status === 'assigned' && (
        <button type="button" className="btn primary block" onClick={() => start(ticket.id)}>
          <Icon name="pin" /> Start visit
        </button>
      )}

      {isWorker && ticket.status === 'on_site' && (
        <form className="stack" onSubmit={sendProof}>
          <h2>After</h2>
          <MediaPicker
            media={proofMedia}
            setMedia={setProofMedia}
            sample={{ title: 'After repair', caption: house.name, tone: 'done' }}
          />
          <label className="field">
            <span>What you did</span>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {proofError && <p className="error">{proofError}</p>}
          <button type="submit" className="btn primary block"><Icon name="camera" /> Submit photo</button>
        </form>
      )}

      <section>
        <h2>Activity</h2>
        <Activity ticket={ticket} />
      </section>

      {state.role === 'manager' && ticket.status === 'proof' && (
        <button type="button" className="btn primary block" onClick={() => setCloseOpen(true)}>
          <Icon name="flag" /> Close ticket
        </button>
      )}

      {assignOpen && (
        <Sheet title="Assign" onClose={() => setAssignOpen(false)}>
          <div className="stack">
            {ordered.map((item) => (
              <button
                type="button"
                key={item.id}
                className="choice"
                aria-pressed={picked === item.id}
                onClick={() => setPicked(item.id)}
              >
                <span className="avatar">{initials(item.name)}</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.trade} · {load(item.id)} open</small>
                </span>
                {item.id === suggested.id && <span className="tag">Suggested</span>}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn primary block sheet-action"
            disabled={!picked}
            onClick={() => {
              assign(ticket.id, picked)
              setAssignOpen(false)
            }}
          >
            <Icon name="check" /> Assign {workerById(picked)?.name || 'worker'}
          </button>
        </Sheet>
      )}

      {closeOpen && (
        <Sheet title={ticket.id} onClose={() => setCloseOpen(false)}>
          <div className="stack">
            <button
              type="button"
              className="btn primary block"
              onClick={() => {
                close(ticket.id)
                setCloseOpen(false)
              }}
            >
              <Icon name="flag" /> Close ticket
            </button>
            <button type="button" className="btn ghost block" onClick={() => setCloseOpen(false)}>
              <Icon name="back" /> Keep it open
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}
