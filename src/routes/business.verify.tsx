import { createFileRoute } from "@tanstack/react-router"
import { BusinessVerify } from "@/components/business/business-verify-page"

export const Route = createFileRoute("/business/verify")({
  component: BusinessVerify,
})
