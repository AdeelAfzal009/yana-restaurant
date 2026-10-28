// Google Wallet passes for Yana Honors, over Google's REST API. Deliberately
// dependency-free: a service account signs its own JWTs with node:crypto.
//
// One LoyaltyClass holds the look: "YANA" with "Honors" under it at the top
// (all the closed card shows), the colour, and a row showing the tier. Each member is a LoyaltyObject in it
// with their name, member number, tier and whether the card is active; no
// barcode. Keeping the tier on the object means a tier change never has to
// move a card between classes. The
// "Add to Google Wallet" button is a link with a signed JWT naming the object.
//
// Setup: Google Pay & Wallet Console → issuer account; Google Cloud → service
// account with access to the issuer. Without the env vars below the feature is
// off and the add page offers Apple Wallet only.
import { createSign } from 'node:crypto'
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import type { Guest, HonorsMember } from '../database/schema'
import { memberName, publicOrigin } from './honors'
import { getMailConfig } from './mail'

const API = 'https://walletobjects.googleapis.com/walletobjects/v1'
const SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer'

export function getGoogleWalletConfig() {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || ''
  const email = process.env.GOOGLE_WALLET_SA_EMAIL || ''
  // Hosts often store a PEM key on one line with literal \n, and the BEGIN /
  // END lines are easy to leave out when copying it from the JSON key file.
  let privateKey = (process.env.GOOGLE_WALLET_SA_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim()
  if (privateKey && !privateKey.startsWith('-----BEGIN')) privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`
  return {
    issuerId,
    email,
    privateKey,
    // Keeps a local or test copy from overwriting the live site's cards (and
    // their look) when both use the same issuer account.
    objectPrefix: process.env.GOOGLE_WALLET_OBJECT_PREFIX || 'yh',
    enabled: Boolean(issuerId && email && privateKey)
  }
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url')

function signJwt(claims: Record<string, unknown>, privateKey: string) {
  const unsigned = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(JSON.stringify(claims))}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(privateKey)
  return `${unsigned}.${base64url(signature)}`
}

let accessToken: { value: string, expiresAt: number } | null = null

async function getAccessToken() {
  if (accessToken && accessToken.expiresAt > Date.now() + 60_000) return accessToken.value
  const { email, privateKey } = getGoogleWalletConfig()
  const now = Math.floor(Date.now() / 1000)
  const assertion = signJwt({ iss: email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }, privateKey)
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
  })
  const body = await response.json().catch(() => ({})) as { access_token?: string, expires_in?: number, error_description?: string }
  if (!response.ok || !body.access_token) throw new Error(`Google sign-in failed: ${body.error_description || `HTTP ${response.status}`}`)
  accessToken = { value: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 }
  return accessToken.value
}

async function walletApi(method: string, path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { authorization: `Bearer ${await getAccessToken()}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  if (response.ok || response.status === 404 || response.status === 409) return response.status
  const error = await response.json().catch(() => ({})) as { error?: { message?: string } }
  throw new Error(`Google Wallet ${method} ${path.split('/')[1]} failed: ${error.error?.message || `HTTP ${response.status}`}`)
}

// Inserts, or replaces what's there when it already exists. Replacing (not
// patching) also clears anything an older version of the card had, such as
// a banner or barcode.
async function upsert(kind: 'loyaltyClass' | 'loyaltyObject', resource: { id: string }) {
  if (await walletApi('POST', `/${kind}`, resource) === 409) {
    await walletApi('PUT', `/${kind}/${encodeURIComponent(resource.id)}`, resource)
  }
}

const text = (value: string) => ({ defaultValue: { language: 'en', value } })

function loyaltyClass(origin: string) {
  const { issuerId, objectPrefix } = getGoogleWalletConfig()
  return {
    // A local or test copy keeps its own class too, so it can't change the
    // live cards' look.
    id: `${issuerId}.${objectPrefix === 'yh' ? '' : `${objectPrefix}_`}yana_honors`,
    // Google always writes the program name under the logo, so the logo is
    // just "YANA" and the program name is "Honors". On Android the wide logo
    // replaces the round logo and the issuer name; elsewhere (such as the
    // save page) the round logo and issuer name show instead.
    issuerName: 'YANA',
    programName: 'Honors',
    programLogo: { sourceUri: { uri: `${publicOrigin(origin)}/honors/google-logo-yana.png` }, contentDescription: text('YANA') },
    wideProgramLogo: { sourceUri: { uri: `${publicOrigin(origin)}/honors/google-wide-yana.png` }, contentDescription: text('YANA') },
    hexBackgroundColor: '#0F1E2E',
    accountNameLabel: 'Guest name',
    accountIdLabel: 'Member ID',
    homepageUri: { uri: getMailConfig().siteUrl, description: 'YANA Restaurant' },
    // Guest name and member ID are on the card front by default; this adds
    // the tier below them.
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [{ oneItem: { item: { firstValue: { fields: [{ fieldPath: "object.textModulesData['tier']" }] } } } }]
      }
    },
    multipleDevicesAndHoldersAllowedStatus: 'ONE_USER_ALL_DEVICES',
    reviewStatus: 'UNDER_REVIEW'
  }
}

function loyaltyObject(member: HonorsMember, guest: Guest, origin: string) {
  const { issuerId, objectPrefix } = getGoogleWalletConfig()
  const tier = HONORS_TIER_LABEL[member.tier]
  return {
    id: `${issuerId}.${objectPrefix}_${member.memberNumber.replace(/\W/g, '')}`,
    classId: loyaltyClass(origin).id,
    state: member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    accountName: memberName(guest),
    accountId: member.memberNumber,
    textModulesData: [{ id: 'tier', header: 'Tier', body: tier }]
  }
}

// The class is written once per server start, so a change to the look here
// reaches every card without a manual step.
let classWritten: Promise<void> | null = null

function ensureClass(origin: string) {
  classWritten ??= upsert('loyaltyClass', loyaltyClass(origin)).catch((error) => {
    classWritten = null
    throw error
  })
  return classWritten
}

// The "Add to Google Wallet" address for this member's card, writing the card
// to Google first so it matches the dashboard.
export async function googleSaveUrl(member: HonorsMember, guest: Guest, origin: string) {
  const { email, privateKey } = getGoogleWalletConfig()
  await ensureClass(origin)
  const object = loyaltyObject(member, guest, origin)
  await upsert('loyaltyObject', object)
  const jwt = signJwt({
    iss: email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [origin],
    payload: { loyaltyObjects: [{ id: object.id }] }
  }, privateKey)
  return `https://pay.google.com/gp/v/save/${jwt}`
}

// Brings a card already in someone's Google Wallet in line with the dashboard
// (tier, name, revoked). A card nobody has added yet is left alone. Never
// throws: the dashboard change stands even if Google can't be reached.
export async function syncGoogleCard(member: HonorsMember, guest: Guest, origin: string) {
  if (!getGoogleWalletConfig().enabled) return null
  try {
    await ensureClass(origin)
    const object = loyaltyObject(member, guest, origin)
    await walletApi('PUT', `/loyaltyObject/${encodeURIComponent(object.id)}`, object)
    return null
  } catch (error) {
    console.error('[google-wallet]', error)
    return 'The card in Google Wallet could not be updated. Try again in a few minutes.'
  }
}
