import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import {
  BusinessApplicationsPage,
  FitnessApplicationPage,
} from "@/features/fitness/fitness-application-page"

export const Route = createFileRoute("/business/_portal/fitness/apply")({
  component: FitnessApplyRoute,
})

function FitnessApplyRoute() {
  const navigate = useNavigate()
  return (
    <>
      <BusinessApplicationsPage />
      <BusinessFormDrawer
        title="Fitness application"
        description="Select food handlers, choose a facility, and review payment."
        onClose={() => void navigate({ to: "/business/applications" })}
      >
        <FitnessApplicationPage
          inDrawer
          onPaid={() => void navigate({ to: "/business/fitness/tracker" })}
        />
      </BusinessFormDrawer>
    </>
  )
}
