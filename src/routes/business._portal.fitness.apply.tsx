import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FitnessApplicationPage } from "@/features/fitness/fitness-application-page"

export const Route = createFileRoute("/business/_portal/fitness/apply")({
  component: FitnessApplyRoute,
})

function FitnessApplyRoute() {
  const navigate = useNavigate()
  return (
    <FitnessApplicationPage
      onPaid={() => {
        void navigate({ to: "/business/fitness/tracker" })
      }}
    />
  )
}
