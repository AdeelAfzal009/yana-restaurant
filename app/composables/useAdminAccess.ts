import { hasAny, hasContentAccess } from '#shared/utils/permissions'

export interface AdminSessionUser {
  id: number
  name: string
  email: string
  role: 'manager' | 'host'
  permissions: string[]
  mustChangePassword?: boolean
}

// The signed-in dashboard user and what they may open. Shares the session
// request with the layout, so calling it in several places costs nothing.
export function useAdminAccess() {
  const request = useFetch<{ authed: boolean, user?: AdminSessionUser }>('/api/admin/session', { key: 'admin-session' })
  const { data, refresh } = request
  const user = computed(() => data.value?.user ?? null)
  const permissions = computed(() => user.value?.permissions ?? [])
  return {
    // Await this where the page must know the user before it renders.
    ready: request,
    user,
    refresh,
    isManager: computed(() => user.value?.role === 'manager'),
    can: (...keys: string[]) => hasAny(permissions.value, keys),
    canContent: computed(() => hasContentAccess(permissions.value))
  }
}
