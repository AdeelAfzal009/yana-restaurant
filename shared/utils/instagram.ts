// What /api/instagram returns: the restaurant's Instagram profile and posts.

export interface InstagramPost {
  id: string
  code: string // the part of the link after /p/ or /reel/
  type: 'video' | 'image'
  media: string // video or photo
  cover: string // photo shown before a video plays
  caption: string
  permalink: string
  timestamp: string
  likes: number | null
  comments: number | null
}

export interface InstagramFeed {
  connected: boolean
  username: string
  name: string
  picture: string
  posts: InstagramPost[]
}

export const EMPTY_INSTAGRAM_FEED: InstagramFeed = { connected: false, username: '', name: '', picture: '', posts: [] }

// "DelwxqIqKL0" from https://www.instagram.com/reel/DelwxqIqKL0/?igsh=…
export const instagramCode = (url: string) => /instagram\.com\/(?:[\w.]+\/)?(?:p|reels?|tv)\/([\w-]+)/i.exec(url)?.[1] ?? ''
