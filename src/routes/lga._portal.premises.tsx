import { createFileRoute } from "@tanstack/react-router"
import { LgaPremisesPage } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/premises")({
  component: LgaPremisesPage,
})
