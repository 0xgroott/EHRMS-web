import { createFileRoute } from "@tanstack/react-router"
import { BusinessSettingsPage } from "@/components/business/business-settings-page"

export const Route = createFileRoute("/business/_portal/settings")({
  component: BusinessSettingsPage,
})
