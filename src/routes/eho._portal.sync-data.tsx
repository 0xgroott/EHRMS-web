import { createFileRoute } from "@tanstack/react-router"
import { EhoSyncDataPage } from "@/features/eho/eho-sync-data-page"

export const Route = createFileRoute("/eho/_portal/sync-data")({
  component: EhoSyncDataPage,
})
