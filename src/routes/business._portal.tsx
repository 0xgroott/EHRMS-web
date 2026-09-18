import { createFileRoute } from "@tanstack/react-router"
import { BusinessPortalAccess } from "@/components/business/business-portal-access"
import { BusinessShell } from "@/components/business/business-shell"

export const Route = createFileRoute("/business/_portal")({
  component: () => (
    <BusinessPortalAccess>
      <BusinessShell />
    </BusinessPortalAccess>
  ),
})
