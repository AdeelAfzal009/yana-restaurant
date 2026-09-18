import { asc } from 'drizzle-orm'
import { floorDecor, floorSections, restaurantTables } from '../../../database/schema'
import { requireAuth } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const db = useDb()
  const [sections, tables, decor] = await Promise.all([
    db.select().from(floorSections).orderBy(asc(floorSections.sortOrder), asc(floorSections.id)),
    db.select().from(restaurantTables).orderBy(asc(restaurantTables.sortOrder), asc(restaurantTables.id)),
    db.select().from(floorDecor).orderBy(asc(floorDecor.id))
  ])

  return sections.map(section => ({
    ...section,
    tables: tables.filter(t => t.sectionId === section.id),
    decor: decor.filter(d => d.sectionId === section.id)
  }))
})
