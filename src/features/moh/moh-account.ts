export interface MohAccount {
  id: string
  name: string
  email: string
  councilId: string
}

// Fictional frontend account. Authentication and verification require a service before release.
export const assignedMohAccount: MohAccount = {
  id: "MOH-001",
  name: "Dr. Nengi Alabo",
  email: "nengi.alabo@phc.gov.ng",
  councilId: "phc",
}

export const assignedMohCredentials = {
  password: "director-demo",
  verificationCode: "246810",
} as const

export function matchMohAccount(
  contact: string,
  password: string
): MohAccount | null {
  const normalized = contact.trim().toLowerCase()
  return password === assignedMohCredentials.password &&
    (normalized === assignedMohAccount.id.toLowerCase() ||
      normalized === assignedMohAccount.email)
    ? assignedMohAccount
    : null
}

export function verifyMohCode(code: string): boolean {
  return code.trim() === assignedMohCredentials.verificationCode
}
