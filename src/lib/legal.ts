export type CourtStatus = 'Open' | 'Pending' | 'In Progress' | 'Adjourned' | 'Closed' | 'Dismissed' | 'Accepted' | 'Unknown'

export interface CourtCase {
  id: string
  title: string
  forumUrl: string
  court?: string
  status: CourtStatus
  summary?: string
  facts?: string
  charges?: string
  evidence?: string
  notes?: string
  rawText?: string
  fetchedAt?: string
  createdAt: string
}

const KEY = 'uag_court_cases'

export function getCourtCases(): CourtCase[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CourtCase[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCourtCases(cases: CourtCase[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cases))
  } catch {}
}

export function addCourtCase(c: Omit<CourtCase, 'id' | 'createdAt'>): CourtCase {
  const item: CourtCase = {
    ...c,
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  const list = [item, ...getCourtCases()]
  saveCourtCases(list)
  return item
}

export function updateCourtCase(id: string, patch: Partial<CourtCase>) {
  const list = getCourtCases().map((c) => (c.id === id ? { ...c, ...patch } : c))
  saveCourtCases(list)
}

export function removeCourtCase(id: string) {
  saveCourtCases(getCourtCases().filter((c) => c.id !== id))
}
