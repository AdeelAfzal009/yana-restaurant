import { getCurrentStaff } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const current = await getCurrentStaff(event)
  if (!current) return { authed: false as const }

  return {
    authed: true as const,
    user: {
      id: current.id,
      name: current.name,
      email: current.email,
      role: current.role
    }
  }
})
