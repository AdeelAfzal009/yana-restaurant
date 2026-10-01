// Thin wrapper over Resend's REST API. Deliberately dependency-free: one POST
// with a bearer token is all the transactional API needs.
//
// Without RESEND_API_KEY the app runs in dry-run mode — every send is logged to
// the console and recorded as 'skipped', so local work and CI never send mail.

export interface MailAttachment {
  filename: string
  /** Raw text content; encoded to base64 before sending. */
  content: string
}

export interface MailMessage {
  to: string
  subject: string
  html: string
  text: string
  attachments?: MailAttachment[]
}

export interface MailResult {
  status: 'sent' | 'failed' | 'skipped'
  providerId?: string
  error?: string
}

export function getMailConfig() {
  const apiKey = process.env.RESEND_API_KEY || ''
  return {
    apiKey,
    // Resend's sandbox sender works before a domain is verified, but only
    // delivers to the account owner's own address.
    from: process.env.MAIL_FROM || 'YANA Restaurant <onboarding@resend.dev>',
    replyTo: process.env.MAIL_REPLY_TO || '',
    staffTo: process.env.MAIL_STAFF_TO || '',
    siteUrl: (process.env.MAIL_SITE_URL || 'https://yana-restaurant-production.up.railway.app').replace(/\/$/, ''),
    phone: process.env.MAIL_PHONE || '+971 2 447 6998',
    // Explicit override wins, otherwise dry-run whenever there's no key.
    dryRun: process.env.MAIL_DRY_RUN === '1' || !apiKey
  }
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const config = getMailConfig()

  if (!message.to) return { status: 'skipped', error: 'no recipient' }

  if (config.dryRun) {
    console.info(`[mail:dry-run] to=${message.to} subject="${message.subject}"${message.attachments?.length ? ` attachments=${message.attachments.map(a => a.filename).join(',')}` : ''}`)
    return { status: 'skipped', error: 'dry run — RESEND_API_KEY not set' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(config.replyTo ? { reply_to: config.replyTo } : {}),
        ...(message.attachments?.length
          ? {
              attachments: message.attachments.map(a => ({
                filename: a.filename,
                content: Buffer.from(a.content, 'utf8').toString('base64')
              }))
            }
          : {})
      })
    })

    const body = await response.json().catch(() => ({})) as { id?: string, message?: string, name?: string }

    if (!response.ok) {
      return { status: 'failed', error: body.message || body.name || `HTTP ${response.status}` }
    }
    return { status: 'sent', providerId: body.id }
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : String(error) }
  }
}
