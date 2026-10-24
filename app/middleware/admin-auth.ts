import { accessForPath, hasAny, homePathFor } from '#shared/utils/permissions'

export default defineNuxtRouteMiddleware(async (to) => {
  // useRequestFetch forwards the incoming cookies during SSR, so the guard
  // resolves on the server and the page never renders for a signed-out visitor.
  const requestFetch = useRequestFetch()

  type Session = { authed: boolean, user?: { mustChangePassword?: boolean, permissions?: string[] } }
  // Signing in returns to the page that was asked for, e.g. a member card
  // scanned with a phone that wasn't signed in yet.
  const login = { path: '/admin/login', query: to.path === '/admin' ? {} : { next: to.fullPath } }
  let session: Session
  try {
    session = await requestFetch<Session>('/api/admin/session')
  } catch {
    return navigateTo(login)
  }

  if (!session.authed) return navigateTo(login)
  // Accounts with a temporary password go straight to set their own.
  if (session.user?.mustChangePassword && to.path !== '/admin/password') {
    return navigateTo('/admin/password')
  }

  // Pages this user hasn't been given send them to one they have.
  const permissions = session.user?.permissions ?? []
  const needs = accessForPath(to.path)
  if (needs && !hasAny(permissions, needs)) {
    const home = homePathFor(permissions)
    if (home !== to.path) return navigateTo(home, { replace: true })
  }
})
