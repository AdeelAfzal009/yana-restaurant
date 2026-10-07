export default defineNuxtRouteMiddleware(async (to) => {
  // useRequestFetch forwards the incoming cookies during SSR, so the guard
  // resolves on the server and the page never renders for a signed-out visitor.
  const requestFetch = useRequestFetch()

  try {
    const session = await requestFetch<{ authed: boolean, user?: { mustChangePassword?: boolean } }>('/api/admin/session')
    if (!session.authed) return navigateTo('/admin/login')
    // Accounts with a temporary password go straight to set their own.
    if (session.user?.mustChangePassword && to.path !== '/admin/password') {
      return navigateTo('/admin/password')
    }
  } catch {
    return navigateTo('/admin/login')
  }
})
