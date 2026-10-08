import { getContentPage } from '#shared/content'
import type { ContentKey, ContentTypes } from '#shared/content'
import { pageDefaults } from '#shared/content/schema'

// A page's editable content for the website: saved edits merged over the
// built-in defaults. Every caller of the same page shares one request, and if
// it fails the defaults are shown, so the site never has empty sections.
function contentFetch<K extends ContentKey>(key: K) {
  const request = useFetch<ContentTypes[K]>(`/api/content/${key}`, { key: `content:${key}` })
  const defaults = pageDefaults(getContentPage(key)!) as unknown as ContentTypes[K]
  const content = computed(() => (request.data.value as ContentTypes[K] | null | undefined) ?? defaults)
  return { request, content }
}

// For shared parts (header, footer): rendered on the server, no waiting.
export function useContent<K extends ContentKey>(key: K) {
  return contentFetch(key).content
}

// For pages: waits for the content, so moving between pages never flashes
// the default text before the saved text arrives.
export async function usePageContent<K extends ContentKey>(key: K) {
  const { request, content } = contentFetch(key)
  await request
  return content
}

// Page title and description for Google and link previews, from the page's
// "Search & sharing" section.
export function useContentSeo(seo: () => { title: string, description: string }) {
  useSeoMeta({
    title: () => seo().title,
    ogTitle: () => seo().title,
    description: () => seo().description || undefined,
    ogDescription: () => seo().description || undefined
  })
}
