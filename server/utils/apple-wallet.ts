// Apple Wallet passes (.pkpass) for Yana Honors, signed with the Pass Type ID
// certificate from the Apple Developer account. Store card style, no barcode:
// tier at the top, the tier's banner, then member name and number.
//
// The passes are static: Apple has no way to change a pass already on a phone
// without a pass update web service, which this doesn't run. A revoked card
// stays in the guest's Apple Wallet, so staff check the status in the
// dashboard (search by member ID) when in doubt.
import { HONORS_TIER_LABEL } from '#shared/utils/honors'
import { PKPass } from 'passkit-generator'
import type { Guest, HonorsMember } from '../database/schema'
import { memberName } from './honors'
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

async function passImages(tier: HonorsMember['tier']) {
  const storage = useStorage('assets:server')
  const files: Record<string, Buffer> = {}
  for (const suffix of ['', '@2x', '@3x']) {
    for (const [name, source] of [['icon', 'icon'], ['logo', 'logo'], ['strip', `strip-${tier}`]]) {
      const data = await storage.getItemRaw<Buffer>(`honors/${source}${suffix}.png`)
      if (!data) throw new Error(`Missing pass image honors/${source}${suffix}.png`)
      files[`${name}${suffix}.png`] = Buffer.from(data)
    }
  }
  return files
}

export async function buildApplePass(member: HonorsMember, guest: Guest) {
  const config = getAppleWalletConfig()
  const { siteUrl, phone } = getMailConfig()
  const tier = HONORS_TIER_LABEL[member.tier]

  const pass = new PKPass(await passImages(member.tier), {
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
    backgroundColor: 'rgb(12, 29, 47)',
    foregroundColor: 'rgb(232, 189, 115)',
    labelColor: 'rgb(201, 164, 101)',
    sharingProhibited: true
  })
  pass.type = 'storeCard'
  pass.headerFields.push({ key: 'tier', label: 'TIER', value: tier.toUpperCase() })
  pass.secondaryFields.push(
    { key: 'name', label: 'MEMBER NAME', value: memberName(guest) },
    { key: 'member', label: 'MEMBER ID', value: member.memberNumber, textAlignment: 'PKTextAlignmentRight' }
  )
  pass.backFields.push(
    { key: 'about', label: 'Yana Honors', value: 'Show this card when you visit YANA to enjoy your member benefits.' },
    { key: 'phone', label: 'Reservations', value: phone },
    { key: 'web', label: 'Website', value: siteUrl }
  )
  return pass.getAsBuffer()
}
