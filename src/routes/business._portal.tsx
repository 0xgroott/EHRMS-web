import { createFileRoute } from "@tanstack/react-router"
import { BusinessPortalAccess } from "@/components/business/business-portal-access"
import { BusinessShell } from "@/components/business/business-shell"
import { FitnessProvider } from "@/features/fitness/fitness-context"
import { FumigationProvider } from "@/features/fumigation/fumigation-context"

export const Route = createFileRoute("/business/_portal")({
  component: () => (
    <BusinessPortalAccess>
      <FitnessProvider>
        <FumigationProvider>
          <BusinessShell />
        </FumigationProvider>
      </FitnessProvider>
    </BusinessPortalAccess>
  ),
})
