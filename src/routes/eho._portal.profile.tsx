import { createFileRoute } from "@tanstack/react-router"
import { EhoProfilePage } from "@/features/eho/eho-profile-page"

export const Route = createFileRoute("/eho/_portal/profile")({
  component: EhoProfilePage,
})
