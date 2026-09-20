import { createFileRoute } from "@tanstack/react-router"
import { FitnessApplicationPage } from "@/features/fitness/fitness-application-page"

export const Route = createFileRoute("/business/_portal/fitness/apply")({
  component: FitnessApplyRoute,
})

function FitnessApplyRoute() {
  return <FitnessApplicationPage />
}
