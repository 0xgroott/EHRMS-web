import { createFileRoute } from "@tanstack/react-router"
import { FitnessCertificatePage } from "@/features/fitness/fitness-certificate-page"

export const Route = createFileRoute("/business/_portal/fitness/certificate")({
  component: FitnessCertificatePage,
})
