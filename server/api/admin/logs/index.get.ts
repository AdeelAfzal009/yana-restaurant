import { asc } from 'drizzle-orm'
import { staff } from '../../../database/schema'
import { decodeCursor, getActivityFeed, getActivitySummary, LOG_CATEGORIES } from '../../../utils/activity-feed'
import type { LogCategory } from '../../../utils/activity-feed'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

// The Logs page: newest first, 50 at a time. ?category=, ?staffId=,
// ?problems=1 and ?cursor= (from the previous page) narrow it down.
export default defineEventHandler(async (event) => {
  await requireManager(event)
  const q = getQuery(event)
  const category = LOG_CATEGORIES.includes(q.category as LogCategory) ? q.category as LogCategory : null
  const staffId = Number(q.staffId) > 0 ? Number(q.staffId) : null
  const cursor = decodeCursor(q.cursor)

  const feed = await getActivityFeed({ category, staffId, problemsOnly: q.problems === '1', cursor, limit: 50 })
  // The summary and the people list only matter for the first page.
  if (cursor) return feed

  const [summary, people] = await Promise.all([
    getActivitySummary(),
    useDb().select({ id: staff.id, name: staff.name, active: staff.active }).from(staff).orderBy(asc(staff.name))
  ])
  return { ...feed, summary, people }
})
