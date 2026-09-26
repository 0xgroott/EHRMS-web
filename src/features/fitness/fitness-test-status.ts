import { certificateIsValid } from "@/domain/certificate-validity"
import type { FitnessState } from "./fitness-types"

export type FitnessTestStatus =
  "Approved" | "In progress" | "Expired" | "Not approved"

export function fitnessTestStatus(
  state: Pick<FitnessState, "application" | "history">,
  handlerId: string
): FitnessTestStatus {
  const applications = [state.application, ...(state.history ?? [])].filter(
    (application) => application !== null
  )
  const certificates = applications
    .map((application) => application.certificate)
    .filter((certificate) => certificate !== undefined)

  if (
    certificates.some(
      (certificate) =>
        certificate.handlerIds.includes(handlerId) &&
        certificateIsValid(certificate.expiresAt)
    )
  )
    return "Approved"

  if (
    state.application?.stage !== "issued" &&
    state.application?.handlerIds.includes(handlerId)
  )
    return "In progress"

  if (
    certificates.some((certificate) =>
      certificate.handlerIds.includes(handlerId)
    )
  )
    return "Expired"

  return "Not approved"
}
