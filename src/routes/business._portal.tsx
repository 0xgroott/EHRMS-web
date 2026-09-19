import { createFileRoute } from "@tanstack/react-router"
import { BusinessPortalAccess } from "@/components/business/business-portal-access"
import { BusinessShell } from "@/components/business/business-shell"
import { FitnessProvider } from "@/features/fitness/fitness-context"
import { FumigationProvider } from "@/features/fumigation/fumigation-context"
import { InspectionProvider } from "@/features/inspection/inspection-context"
import { BusinessMediaProvider } from "@/features/business-media/business-media-context"

export const Route = createFileRoute("/business/_portal")({
  component: () => (
    <BusinessPortalAccess>
      <FitnessProvider>
        <FumigationProvider>
          <InspectionProvider>
            <BusinessMediaProvider>
              <BusinessShell />
            </BusinessMediaProvider>
          </InspectionProvider>
        </FumigationProvider>
      </FitnessProvider>
    </BusinessPortalAccess>
  ),
})
