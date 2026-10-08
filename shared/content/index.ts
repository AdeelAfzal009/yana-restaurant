import { ABOUT_PAGE } from './about'
import type { AboutContent } from './about'
import { CONTACT_PAGE } from './contact'
import type { ContactContent } from './contact'
import { GALLERY_PAGE } from './gallery'
import type { GalleryContent } from './gallery'
import { HOME_PAGE } from './home'
import type { HomeContent } from './home'
import { LAYOUT_PAGE } from './layout'
import type { LayoutContent } from './layout'
import { MENU_PAGE } from './menu'
import type { MenuContent } from './menu'
import { RESERVATION_PAGE } from './reservation'
import type { ReservationContent } from './reservation'
import type { ContentPage } from './schema'
import { SITE_PAGE } from './site'
import type { SiteInfo } from './site'

// Every page whose content can be edited from the dashboard, in the order the
// dashboard lists them.
export const CONTENT_PAGES: ContentPage[] = [
  SITE_PAGE,
  LAYOUT_PAGE,
  HOME_PAGE,
  ABOUT_PAGE,
  MENU_PAGE,
  GALLERY_PAGE,
  CONTACT_PAGE,
  RESERVATION_PAGE
]

// The value type each page's content has on the website.
export interface ContentTypes {
  site: SiteInfo
  layout: LayoutContent
  home: HomeContent
  about: AboutContent
  menu: MenuContent
  gallery: GalleryContent
  contact: ContactContent
  reservation: ReservationContent
}

export type ContentKey = keyof ContentTypes

export function getContentPage(key: string) {
  return CONTENT_PAGES.find(p => p.key === key) ?? null
}
