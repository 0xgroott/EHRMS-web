import { createFileRoute } from "@tanstack/react-router"
import { EhoPremisesSearchPage } from "@/features/eho/eho-premises-search-page"

export const Route = createFileRoute("/eho/_portal/premises-search")({
  component: EhoPremisesSearchPage,
})
