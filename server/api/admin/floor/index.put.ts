import { eq, notInArray } from 'drizzle-orm'
import { decorKindEnum, floorDecor, floorSections, restaurantTables, tableShapeEnum } from '../../../database/schema'
import { requireManager } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { badRequest } from '../../../utils/validate'

interface TableInput {
  id?: number
  name: string
  minCovers: number
  maxCovers: number
  shape: string
  x: number
  y: number
  width: number
  height: number
}

interface DecorInput {
  kind: string
  label?: string | null
  x: number
  y: number
  width: number
  height: number
}

interface SectionInput {
  id?: number
  name: string
  tables: TableInput[]
  decor: DecorInput[]
}

const int = (v: unknown, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)))

// Saves the whole floor plan. Tables keep their ids when edited so reservations
// stay assigned; tables removed here are deleted and their bookings unassigned.
export default defineEventHandler(async (event) => {
  await requireManager(event)

  const body = await readBody<{ sections?: SectionInput[] }>(event)
  const sections = body?.sections
  if (!Array.isArray(sections) || sections.length === 0) badRequest('At least one section is required')

  const allNames = new Set<string>()
  for (const section of sections) {
    if (!section.name?.trim()) badRequest('Every section needs a name')
    for (const table of section.tables ?? []) {
      const name = table.name?.trim()
      if (!name) badRequest(`A table in ${section.name} has no name`)
      if (allNames.has(name.toLowerCase())) badRequest(`Table name "${name}" is used twice`)
      allNames.add(name.toLowerCase())
      if (!tableShapeEnum.enumValues.includes(table.shape as never)) badRequest('Invalid table shape')
      if (int(table.maxCovers, 1, 50) < int(table.minCovers, 1, 50)) badRequest(`Table ${name}: max covers is below min covers`)
    }
    for (const d of section.decor ?? []) {
      if (!decorKindEnum.enumValues.includes(d.kind as never)) badRequest('Invalid decoration')
    }
  }

  const db = useDb()
  // Order matters: sections first (new ones need ids), then tables are upserted —
  // possibly moving between sections — and only then are leftovers deleted.
  await db.transaction(async (tx) => {
    const sectionIds: number[] = []
    for (const [sIndex, section] of sections.entries()) {
      if (section.id) {
        await tx.update(floorSections).set({ name: section.name.trim(), sortOrder: sIndex }).where(eq(floorSections.id, section.id))
        sectionIds.push(section.id)
      } else {
        const [created] = await tx.insert(floorSections).values({ name: section.name.trim(), sortOrder: sIndex }).returning({ id: floorSections.id })
        sectionIds.push(created!.id)
      }
    }

    const keptTableIds: number[] = []
    for (const [sIndex, section] of sections.entries()) {
      const sectionId = sectionIds[sIndex]!
      for (const [tIndex, t] of (section.tables ?? []).entries()) {
        const values = {
          sectionId,
          name: t.name.trim(),
          minCovers: int(t.minCovers, 1, 50),
          maxCovers: int(t.maxCovers, 1, 50),
          shape: t.shape as (typeof tableShapeEnum.enumValues)[number],
          x: int(t.x, 0, 1400),
          y: int(t.y, 0, 800),
          width: int(t.width, 20, 600),
          height: int(t.height, 20, 600),
          sortOrder: tIndex
        }
        const [row] = t.id
          ? await tx.update(restaurantTables).set(values).where(eq(restaurantTables.id, t.id)).returning({ id: restaurantTables.id })
          : await tx.insert(restaurantTables).values(values).returning({ id: restaurantTables.id })
        if (row) keptTableIds.push(row.id)
      }

      await tx.delete(floorDecor).where(eq(floorDecor.sectionId, sectionId))
      const decor = section.decor ?? []
      if (decor.length) {
        await tx.insert(floorDecor).values(decor.map(d => ({
          sectionId,
          kind: d.kind as (typeof decorKindEnum.enumValues)[number],
          label: d.label?.trim() || null,
          x: int(d.x, 0, 1400),
          y: int(d.y, 0, 800),
          width: int(d.width, 4, 1400),
          height: int(d.height, 4, 800)
        })))
      }
    }

    await tx.delete(restaurantTables).where(keptTableIds.length ? notInArray(restaurantTables.id, keptTableIds) : undefined)
    await tx.delete(floorSections).where(notInArray(floorSections.id, sectionIds))
  })

  return { ok: true }
})
