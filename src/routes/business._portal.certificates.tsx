import { createFileRoute } from "@tanstack/react-router"
import { BusinessCertificatesPage } from "@/features/fitness/fitness-certificate-page"

export const Route = createFileRoute("/business/_portal/certificates")({
  component: BusinessCertificatesPage,
})
