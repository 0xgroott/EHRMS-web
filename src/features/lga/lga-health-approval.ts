import type { Premises } from "@/domain/types"
import type { LgaApproval } from "./lga-data"

export function healthApprovalStatus(
  premises: Premises,
  approvals: LgaApproval[],
  today = new Date().toISOString().slice(0, 10)
) {
  const approval = approvals
    .filter((item) => item.premisesId === premises.id)
    .sort((a, b) =>
      (b.decidedAt ?? b.date).localeCompare(a.decidedAt ?? a.date)
    )
    .at(0)
  if (approval && approval.status !== "Approved") return approval.status
  const certificate = premises.certificates.find(
    (item) => item.type === "Health Approval"
  )
  if (!certificate || ["Pending", "Not Found"].includes(certificate.status))
    return approval?.status ?? "Not applied"
  if (
    ["Suspended", "Revoked", "Withdrawn", "Replaced"].includes(
      certificate.status
    )
  )
    return certificate.status
  if (certificate.expiresAt && certificate.expiresAt < today) return "Expired"
  return certificate.status === "Active" ? "Approved" : certificate.status
}
