import { createFileRoute } from "@tanstack/react-router"
import { BusinessProfilePage } from "@/features/business-media/business-profile-page"

export const Route = createFileRoute("/business/_portal/profile")({
  component: BusinessProfilePage,
})
