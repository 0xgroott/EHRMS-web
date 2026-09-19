import { createFileRoute } from "@tanstack/react-router"
import { BusinessApplicationsPage } from "@/features/fitness/fitness-application-page"

export const Route = createFileRoute("/business/_portal/applications")({
  component: BusinessApplicationsPage,
})
