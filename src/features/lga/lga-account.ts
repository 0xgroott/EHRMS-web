export interface LgaAccount {
  id: string
  name: string
  email: string
  councilId: string
}

// Fictional assigned account, matching the existing MOH frontend access pattern.
// A real identity service must supply and enforce council assignment before release.
export const assignedLgaAccount: LgaAccount = {
  id: "LGA-001",
  name: "Nimi Douglas",
  email: "chairman@phc.ehrcms.test",
  councilId: "phc",
}
export const assignedLgaCredentials = {
  password: "council-access",
  verificationCode: "482610",
} as const

export function matchLgaAccount(
  contact: string,
  password: string
): LgaAccount | null {
  const normalized = contact.trim().toLowerCase()
  return password === assignedLgaCredentials.password &&
    (normalized === assignedLgaAccount.id.toLowerCase() ||
      normalized === assignedLgaAccount.email)
    ? assignedLgaAccount
    : null
}
export function verifyLgaCode(code: string) {
  return code.trim() === assignedLgaCredentials.verificationCode
}
