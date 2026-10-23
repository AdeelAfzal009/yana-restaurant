import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import { emailLog } from '../database/schema'
import type { Guest, HonorsMember } from '../database/schema'
import { useDb } from './db'
import { escapeHtml, layout, textBlock } from './email-templates'
import { sendMail } from './mail'
import { memberName } from './honors'
import { getEmailContent } from './site-content'

// The "add your card to your wallet" email. Same branded layout as the
// booking emails; the wording is fixed here rather than in Email templates.
export async function sendHonorsCardEmail(member: HonorsMember, guest: Guest, link: string, expiresAt: Date) {
  if (!guest.email) return { status: 'skipped' as const, error: 'guest has no email address' }

  const { shared } = await getEmailContent()
  const tier = HONORS_TIER_LABEL[member.tier]
  const name = memberName(guest)
  const until = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' })
  const heading = 'Welcome to Yana Honors'
  const intro = `Dear ${guest.firstName}, thank you for being part of the YANA family. We are delighted to welcome you as a Yana Honors ${tier} member.`
  const rows: [string, string][] = [['Member name', name], ['Tier', tier], ['Member ID', member.memberNumber]]
  const body = 'Open the link on your phone to add your membership card to Google Wallet or Apple Wallet, then show it to our team on your next visit.'
  const footerNote = `This link is personal to you and works until ${until}. If it has stopped working, ask our team for a new one.`

  const message = {
    to: guest.email,
    subject: `Your Yana Honors ${tier} card`,
    html: layout({
      preheader: 'Add your Yana Honors card to your phone.',
      heading,
      intro: escapeHtml(intro),
      rows,
      body: escapeHtml(body),
      ctaLabel: 'Add to my wallet',
      ctaUrl: link,
      footerNote: escapeHtml(footerNote),
      tagline: shared.tagline,
      address: shared.address
    }),
    text: textBlock({ heading, intro, rows, body, ctaLabel: 'Add to my wallet', ctaUrl: link, footerNote, address: shared.address })
  }

  const result = await sendMail(message)
  await useDb().insert(emailLog).values({
    template: 'honors_card',
    recipient: message.to,
    subject: message.subject,
    status: result.status,
    providerId: result.providerId ?? null,
    error: result.error ?? null
  })
  if (result.status === 'failed') console.error(`[mail] honors_card to ${message.to} failed: ${result.error}`)
  return result
}
