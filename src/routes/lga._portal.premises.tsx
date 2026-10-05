import { createFileRoute } from "@tanstack/react-router"
import { LgaPremisesPage } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/premises")({
  validateSearch: (search: Record<string, unknown>) => ({
    approval: typeof search.approval === "string" ? search.approval : "all",
  }),
  component: LgaPremisesPage,
})
