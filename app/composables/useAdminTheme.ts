// Light/dark choice for the admin dashboard. Kept in a cookie (not
// localStorage) so the server renders the right theme and there's no flash.
export type AdminTheme = 'light' | 'dark'

export function useAdminTheme() {
  const theme = useCookie<AdminTheme>('yana_admin_theme', {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/'
  })

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark'
  }

  return { theme, isDark, toggleTheme }
}
