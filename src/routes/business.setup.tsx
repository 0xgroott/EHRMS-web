import { createFileRoute } from "@tanstack/react-router"
import { BusinessSetup } from "@/components/business/business-setup-page"

export const Route = createFileRoute("/business/setup")({
  component: BusinessSetup,
})
