import { createFileRoute } from "@tanstack/react-router"
import { FumigationCertificatePage } from "@/features/fumigation/fumigation-certificate-page"

export const Route = createFileRoute(
  "/business/_portal/fumigation/certificate"
)({
  component: FumigationCertificatePage,
})
