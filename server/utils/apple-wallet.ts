// Apple Wallet passes (.pkpass) for Yana Honors, signed with the Pass Type ID
// certificate from the Apple Developer account. Store card style: tier at the
// top, the "MEMBERSHIP CARD" banner, guest name and member ID, and a QR code
// staff scan to check the card in the dashboard.
//
// The passes are static: Apple has no way to change a pass already on a phone
// without a pass update web service, which this doesn't run. A revoked card
// stays in the guest's Apple Wallet, but scanning its QR code shows it as
// revoked.
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import { PKPass } from 'passkit-generator'
import type { Guest, HonorsMember } from '../database/schema'
import { honorsVerifyUrl, memberName } from './honors'
import { getMailConfig } from './mail'

// PEM values can be stored on one line with literal \n.
const pem = (name: string) => (process.env[name] || '').replace(/\\n/g, '\n')

export function getAppleWalletConfig() {
  const config = {
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || '',
    teamIdentifier: process.env.APPLE_TEAM_ID || '',
    signerCert: pem('APPLE_PASS_CERT'),
    signerKey: pem('APPLE_PASS_KEY'),
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    wwdr: pem('APPLE_WWDR_CERT')
  }
  return { ...config, enabled: Boolean(config.passTypeIdentifier && config.teamIdentifier && config.signerCert && config.signerKey && config.wwdr) }
}

async function passImages() {
  const storage = useStorage('assets:server')
  const files: Record<string, Buffer> = {}
  for (const suffix of ['', '@2x', '@3x']) {
    for (const name of ['icon', 'logo', 'strip']) {
      const data = await storage.getItemRaw<Buffer>(`honors/${name}${suffix}.png`)
      if (!data) throw new Error(`Missing pass image honors/${name}${suffix}.png`)
      files[`${name}${suffix}.png`] = Buffer.from(data)
    }
  }
  return files
}

export async function buildApplePass(member: HonorsMember, guest: Guest, origin: string) {
  const config = getAppleWalletConfig()
  const { siteUrl, phone } = getMailConfig()
  const tier = HONORS_TIER_LABEL[member.tier]

  const pass = new PKPass(await passImages(), {
    wwdr: config.wwdr,
    signerCert: config.signerCert,
    signerKey: config.signerKey,
    signerKeyPassphrase: config.signerKeyPassphrase
  }, {
    formatVersion: 1,
    passTypeIdentifier: config.passTypeIdentifier,
    teamIdentifier: config.teamIdentifier,
    serialNumber: member.memberNumber,
    organizationName: 'YANA',
    description: `Yana Honors ${tier} membership`,
    // The card design: navy, gold values, white labels.
    backgroundColor: 'rgb(15, 30, 46)',
    foregroundColor: 'rgb(234, 183, 122)',
    labelColor: 'rgb(255, 255, 255)',
    sharingProhibited: true
  })
  pass.type = 'storeCard'
  pass.headerFields.push({ key: 'tier', label: 'TIER', value: tier.toUpperCase() })
  pass.secondaryFields.push(
    { key: 'name', label: 'GUEST NAME', value: memberName(guest) },
    { key: 'member', label: 'MEMBER ID', value: member.memberNumber, textAlignment: 'PKTextAlignmentRight' }
  )
  pass.setBarcodes({ format: 'PKBarcodeFormatQR', message: honorsVerifyUrl(origin, member.memberNumber), messageEncoding: 'iso-8859-1', altText: member.memberNumber })
  pass.backFields.push(
    { key: 'about', label: 'Yana Honors', value: 'Show this card when you visit YANA to enjoy your member benefits.' },
    { key: 'phone', label: 'Reservations', value: phone },
    { key: 'web', label: 'Website', value: siteUrl }
  )
  return pass.getAsBuffer()
}
