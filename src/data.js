export const company = {
  name: 'Saffron Homes',
  head: 'Devan Iyer',
  title: 'Site head',
  phone: '+91 98400 11007',
}

export const ownerUser = {
  name: 'Arun Krishnan',
  houseId: 'pg-07',
}

export const categories = [
  { id: 'plumbing', label: 'Plumbing', trade: 'Plumbing', icon: 'drop' },
  { id: 'electrical', label: 'Electrical', trade: 'Electrical', icon: 'bolt' },
  { id: 'paint', label: 'Paint', trade: 'Painting', icon: 'brush' },
  { id: 'carpentry', label: 'Carpentry', trade: 'Carpentry', icon: 'door' },
  { id: 'cracks', label: 'Cracks', trade: 'Civil', icon: 'crack' },
  { id: 'other', label: 'Other', trade: 'General', icon: 'more' },
]

export const rooms = [
  'Kitchen',
  'Bathroom',
  'Bedroom',
  'Living room',
  'Balcony',
  'Terrace',
  'Outside',
  'Common area',
]

export const houses = [
  { id: 'pg-03', project: 'Palm Grove', name: 'Villa 03', owner: 'Meera Iyer', address: 'Villa 03, Palm Grove, Phase 2', handed: 'Nov 2023' },
  { id: 'pg-07', project: 'Palm Grove', name: 'Villa 07', owner: 'Arun Krishnan', address: 'Villa 07, Palm Grove, Phase 2', handed: 'Jan 2024' },
  { id: 'pg-11', project: 'Palm Grove', name: 'Villa 11', owner: 'Fatima Noor', address: 'Villa 11, Palm Grove, Phase 2', handed: 'Mar 2024' },
  { id: 'lv-4b', project: 'Lakeview', name: 'Plot 4B', owner: 'Joseph Mathew', address: 'Plot 4B, Lakeview', handed: 'Aug 2023' },
  { id: 'lv-09', project: 'Lakeview', name: 'Plot 9', owner: 'Divya Menon', address: 'Plot 9, Lakeview', handed: 'Dec 2023' },
  { id: 'lv-14', project: 'Lakeview', name: 'Plot 14', owner: 'Prakash Jain', address: 'Plot 14, Lakeview', handed: 'Feb 2024' },
  { id: 'ch-a201', project: 'Cedar Heights', name: 'Flat A-201', owner: 'Sandeep Rao', address: 'Flat A-201, Cedar Heights', handed: 'Jun 2024' },
  { id: 'ch-b104', project: 'Cedar Heights', name: 'Flat B-104', owner: 'Nalini Das', address: 'Flat B-104, Cedar Heights', handed: 'Jun 2024' },
  { id: 'ch-c302', project: 'Cedar Heights', name: 'Flat C-302', owner: 'Hari Prasad', address: 'Flat C-302, Cedar Heights', handed: 'Jul 2024' },
  { id: 'sr-18', project: 'South Ridge', name: 'House 18', owner: 'Kavitha Reddy', address: 'House 18, South Ridge', handed: 'Sep 2024' },
  { id: 'sr-21', project: 'South Ridge', name: 'House 21', owner: 'Imtiaz Ahmed', address: 'House 21, South Ridge', handed: 'Oct 2024' },
  { id: 'sr-26', project: 'South Ridge', name: 'House 26', owner: 'Leela Nair', address: 'House 26, South Ridge', handed: 'Jan 2025' },
]

export const projects = [...new Set(houses.map((house) => house.project))]

export const workers = [
  { id: 'kumar', name: 'Kumar S.', trade: 'Plumbing', phone: '+91 98410 22018' },
  { id: 'suresh', name: 'Suresh P.', trade: 'Electrical', phone: '+91 98410 22024' },
  { id: 'imran', name: 'Imran K.', trade: 'Carpentry', phone: '+91 98410 22031' },
  { id: 'lakshmi', name: 'Lakshmi V.', trade: 'Painting', phone: '+91 98410 22045' },
  { id: 'ravi', name: 'Ravi G.', trade: 'Civil', phone: '+91 98410 22052' },
  { id: 'anbu', name: 'Anbu T.', trade: 'General', phone: '+91 98410 22067' },
]

export const statusLabel = {
  raised: 'New',
  assigned: 'Assigned',
  on_site: 'On site',
  proof: 'Proof in',
  closed: 'Closed',
}

const photos = {
  water: '/photos/kitchen.jpg',
  bath: '/photos/bathroom.jpg',
  spark: '/photos/living.jpg',
  wood: '/photos/bedroom.jpg',
  crack: '/photos/crack.jpg',
  paint: '/photos/paint.jpg',
  done: '/photos/villa.jpg',
  villa: '/photos/villa.jpg',
}

export function samplePhoto(tone) {
  return photos[tone] || photos.water
}

export function sampleShot({ tone }) {
  return samplePhoto(tone)
}

function shot(id, title, caption, tone) {
  return {
    id,
    kind: 'image',
    name: title,
    url: sampleShot({ title, caption, tone }),
  }
}

export function categoryById(id) {
  return categories.find((item) => item.id === id)
}

export function houseById(id) {
  return houses.find((item) => item.id === id)
}

export function workerById(id) {
  return workers.find((item) => item.id === id)
}

export function initials(name) {
  return name
    .split(' ')
    .filter((part) => part && part !== '&')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function formatWhen(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ago(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}

export function sortTickets(list) {
  return [...list].sort((a, b) => {
    const urgent = Number(b.priority === 'urgent') - Number(a.priority === 'urgent')
    if (urgent) return urgent
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
}

export function upcomingSteps(ticket) {
  if (ticket.status === 'closed') return []
  if (ticket.status === 'proof') {
    return [{ tone: 'ready', text: 'The site office can close this ticket.' }]
  }
  const steps = []
  if (ticket.status === 'raised') {
    steps.push({ tone: 'wait', text: 'The site office assigns a worker.' })
  }
  if (ticket.status === 'raised' || ticket.status === 'assigned') {
    steps.push({ tone: 'wait', text: 'The worker visits the house and starts the repair.' })
  }
  steps.push({
    tone: 'locked',
    text: 'The worker photographs the finished work. The ticket stays open until that photo is here.',
  })
  return steps
}

export function createSeed() {
  const now = Date.now()
  const at = (hoursAgo) => new Date(now - hoursAgo * 3600000).toISOString()

  const tickets = [
    {
      id: 'T-1048',
      houseId: 'pg-07',
      category: 'plumbing',
      room: 'Kitchen',
      description: 'Water pools under the kitchen sink. The waste pipe drips each time the tap runs. It started two days ago.',
      priority: 'urgent',
      status: 'raised',
      workerId: null,
      ownerMedia: [shot('o1048', 'Kitchen sink', 'Drip under the cabinet', 'water')],
      proof: [],
      proofNote: '',
      createdAt: at(2),
      timeline: [{ at: at(2), text: 'Arun Krishnan reported this from Villa 07.' }],
    },
    {
      id: 'T-1046',
      houseId: 'pg-03',
      category: 'plumbing',
      room: 'Bathroom',
      description: 'The shower mixer keeps dripping after it is shut. The bathroom floor stays wet.',
      priority: 'normal',
      status: 'assigned',
      workerId: 'kumar',
      ownerMedia: [shot('o1046', 'Shower mixer', 'Slow drip', 'bath')],
      proof: [],
      proofNote: '',
      createdAt: at(5),
      timeline: [
        { at: at(5), text: 'Meera Iyer reported this from Villa 03.' },
        { at: at(4), text: 'Devan Iyer assigned Kumar S. (Plumbing).' },
      ],
    },
    {
      id: 'T-1044',
      houseId: 'ch-a201',
      category: 'electrical',
      room: 'Living room',
      description: 'The switchboard beside the TV sparks when the fan is switched on.',
      priority: 'urgent',
      status: 'assigned',
      workerId: 'suresh',
      ownerMedia: [shot('o1044', 'Switchboard', 'Spark at the fan switch', 'spark')],
      proof: [],
      proofNote: '',
      createdAt: at(8),
      timeline: [
        { at: at(8), text: 'Sandeep Rao reported this from Flat A-201.' },
        { at: at(7), text: 'Devan Iyer assigned Suresh P. (Electrical).' },
      ],
    },
    {
      id: 'T-1039',
      houseId: 'sr-18',
      category: 'carpentry',
      room: 'Bedroom',
      description: 'The bedroom door scrapes the floor and will not latch. It has to be lifted to close.',
      priority: 'normal',
      status: 'on_site',
      workerId: 'imran',
      ownerMedia: [shot('o1039', 'Bedroom door', 'Scrapes the floor', 'wood')],
      proof: [],
      proofNote: '',
      createdAt: at(26),
      timeline: [
        { at: at(26), text: 'Kavitha Reddy reported this from House 18.' },
        { at: at(24), text: 'Devan Iyer assigned Imran K. (Carpentry).' },
        { at: at(1), text: 'Imran K. reached the house and started the repair.' },
      ],
    },
    {
      id: 'T-1033',
      houseId: 'pg-11',
      category: 'cracks',
      room: 'Outside',
      description: 'A hairline crack has opened on the beam above the car porch.',
      priority: 'normal',
      status: 'proof',
      workerId: 'ravi',
      ownerMedia: [shot('o1033', 'Porch beam', 'Hairline crack', 'crack')],
      proof: [shot('p1033', 'After repair', 'Beam filled and painted', 'done')],
      proofNote: 'Opened the crack, filled it, and repainted the porch beam.',
      createdAt: at(50),
      timeline: [
        { at: at(50), text: 'Fatima Noor reported this from Villa 11.' },
        { at: at(48), text: 'Devan Iyer assigned Ravi G. (Civil).' },
        { at: at(30), text: 'Ravi G. reached the house and started the repair.' },
        { at: at(6), text: 'Ravi G. added a photo of the finished work.' },
      ],
    },
    {
      id: 'T-1021',
      houseId: 'lv-4b',
      category: 'paint',
      room: 'Living room',
      description: 'Paint is peeling on the wall beside the living room window.',
      priority: 'normal',
      status: 'closed',
      workerId: 'lakshmi',
      ownerMedia: [shot('o1021', 'Window wall', 'Peeling paint', 'paint')],
      proof: [shot('p1021', 'After paint', 'Wall repainted', 'done')],
      proofNote: 'Scraped the peel and repainted the window wall.',
      createdAt: at(90),
      timeline: [
        { at: at(90), text: 'Joseph Mathew reported this from Plot 4B.' },
        { at: at(88), text: 'Devan Iyer assigned Lakshmi V. (Painting).' },
        { at: at(80), text: 'Lakshmi V. reached the house and started the repair.' },
        { at: at(76), text: 'Lakshmi V. added a photo of the finished work.' },
        { at: at(70), text: 'Devan Iyer closed the ticket.' },
      ],
    },
  ]

  return { tickets, seq: 1048 }
}
