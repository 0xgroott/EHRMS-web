import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import { BusinessApplicationsPage } from "@/features/fitness/fitness-application-page"
import { FumigationApplicationPage } from "@/features/fumigation/fumigation-application-page"

export const Route = createFileRoute("/business/_portal/fumigation/apply")({
  component: FumigationApplyRoute,
})

function FumigationApplyRoute() {
  const navigate = useNavigate()
  return (
    <>
      <BusinessApplicationsPage />
      <BusinessFormDrawer
        title="Fumigation application"
        description="Confirm your premises, choose a provider, and review payment."
        onClose={() => void navigate({ to: "/business/applications" })}
      >
        <FumigationApplicationPage
          inDrawer
          onPaid={() => void navigate({ to: "/business/fumigation/tracker" })}
        />
      </BusinessFormDrawer>
    </>
  )
}
