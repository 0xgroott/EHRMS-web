import { createFileRoute } from "@tanstack/react-router"
import { BusinessRegister } from "@/components/business/business-register-page"

export const Route = createFileRoute("/business/register")({
  component: BusinessRegister,
})
