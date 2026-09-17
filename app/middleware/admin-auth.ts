export default defineNuxtRouteMiddleware(async () => {
  // useRequestFetch forwards the incoming cookies during SSR, so the guard
  // resolves on the server and the page never renders for a signed-out visitor.
  const requestFetch = useRequestFetch()

  try {
    const session = await requestFetch<{ authed: boolean }>('/api/admin/session')
    if (!session.authed) return navigateTo('/admin/login')
  } catch {
    return navigateTo('/admin/login')
  }
})
