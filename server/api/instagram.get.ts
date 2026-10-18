import { getInstagramFeed } from '../utils/instagram'

// Public: the Gallery page's video slider reads the restaurant's Instagram
// posts from here.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  return getInstagramFeed()
})
