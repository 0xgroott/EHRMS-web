import { createFileRoute } from "@tanstack/react-router"
import { FumigationTrackerPage } from "@/features/fumigation/fumigation-tracker-page"

export const Route = createFileRoute("/business/_portal/fumigation/tracker")({
  component: FumigationTrackerPage,
})
