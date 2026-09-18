import { createFileRoute } from "@tanstack/react-router"
import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export const Route = createFileRoute("/_app/finance")({
  component: () => (
    <ModulePlaceholder
      title="Finance"
      description="Reconcile fees, payments, receipts, and regulatory levies."
    />
  ),
})
