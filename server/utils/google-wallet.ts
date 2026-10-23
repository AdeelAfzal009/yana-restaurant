// Google Wallet passes for Yana Honors, over Google's REST API. Deliberately
// dependency-free: a service account signs its own JWTs with node:crypto.
//
// One LoyaltyClass holds the look (logo, colour); each member is a
// LoyaltyObject in it carrying their tier's banner, tier, name, member number
// and whether the card is active. Keeping the tier on the object means a tier
// change never has to move a card between classes. The
// "Add to Google Wallet" button is a link with a signed JWT naming the object.
//
// Setup: Google Pay & Wallet Console → issuer account; Google Cloud → service
// account with access to the issuer. Without the env vars below the feature is
// off and the add page offers Apple Wallet only.
import { createSign } from 'node:crypto'
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import type { Guest, HonorsMember } from '../database/schema'
import { memberName } from './honors'
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
    // Keeps a local or test copy from overwriting the live site's passes when
    // both use the same issuer account.
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

// Inserts, or replaces what's there when it already exists.
async function upsert(kind: 'loyaltyClass' | 'loyaltyObject', resource: { id: string }) {
  if (await walletApi('POST', `/${kind}`, resource) === 409) {
    await walletApi(kind === 'loyaltyClass' ? 'PUT' : 'PATCH', `/${kind}/${encodeURIComponent(resource.id)}`, resource)
  }
}

// Google fetches the logo and banner itself, so they must come from the live
// https site, never from localhost.
function imageBase(origin: string) {
  return origin.startsWith('https://') ? origin : getMailConfig().siteUrl
}

const text = (value: string) => ({ defaultValue: { language: 'en', value } })

function loyaltyClass(origin: string) {
  const { issuerId } = getGoogleWalletConfig()
  return {
    id: `${issuerId}.yana_honors`,
    issuerName: 'YANA',
    programName: 'Yana Honors',
    programLogo: { sourceUri: { uri: `${imageBase(origin)}/honors/google-logo.png` }, contentDescription: text('YANA') },
    hexBackgroundColor: '#0C1D2F',
    accountNameLabel: 'Member name',
    accountIdLabel: 'Member ID',
    homepageUri: { uri: getMailConfig().siteUrl, description: 'YANA Restaurant' },
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
    heroImage: { sourceUri: { uri: `${imageBase(origin)}/honors/google-hero-${member.tier}.png` }, contentDescription: text(`Yana Honors ${tier}`) },
    textModulesData: [{ id: 'tier', header: 'Tier', body: tier.toUpperCase() }]
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
    await walletApi('PATCH', `/loyaltyObject/${encodeURIComponent(object.id)}`, object)
    return null
  } catch (error) {
    console.error('[google-wallet]', error)
    return 'The card in Google Wallet could not be updated. Try again in a few minutes.'
  }
}
