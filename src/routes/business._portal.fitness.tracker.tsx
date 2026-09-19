import { createFileRoute } from "@tanstack/react-router"
import { FitnessTrackerPage } from "@/features/fitness/fitness-tracker-page"

export const Route = createFileRoute("/business/_portal/fitness/tracker")({
  component: FitnessTrackerPage,
})
