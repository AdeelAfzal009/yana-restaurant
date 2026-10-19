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

// The site's public address (https://…), for canonical links and shares.
export function useSiteOrigin() {
  const configured = useRuntimeConfig().public.siteUrl as string
  if (configured) return configured.replace(/\/+$/, '')
  return useRequestURL({ xForwardedHost: true, xForwardedProto: true }).origin
}

// The photo used for shares when a page has none of its own.
export const DEFAULT_SHARE_IMAGE = '/images/yana-image-2-mruiybvd-26zk.webp'

// Page title, description and share image for Google and link previews, from
// the page's "Search & sharing" section. `fallbackImage` is a photo from the
// page, used when no share image is set.
export function useContentSeo(
  seo: () => { title: string, description: string, image?: { src: string, alt: string } },
  fallbackImage?: () => string | undefined
) {
  const origin = useSiteOrigin()
  const route = useRoute()
  // One address per page: no query string or #section, no trailing slash.
  const canonical = computed(() => `${origin}${route.path === '/' ? '/' : route.path.replace(/\/+$/, '')}`)
  const image = computed(() => {
    const src = seo().image?.src || fallbackImage?.() || DEFAULT_SHARE_IMAGE
    return /^https?:\/\//.test(src) ? src : `${origin}${src}`
  })

  useSeoMeta({
    title: () => seo().title,
    ogTitle: () => seo().title,
    twitterTitle: () => seo().title,
    description: () => seo().description || undefined,
    ogDescription: () => seo().description || undefined,
    twitterDescription: () => seo().description || undefined,
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogImageAlt: () => seo().image?.alt || seo().title,
    twitterImage: () => image.value
  })
  useHead({ link: [{ rel: 'canonical', href: canonical }] })
}
