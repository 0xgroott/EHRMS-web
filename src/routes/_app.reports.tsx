import { createFileRoute } from "@tanstack/react-router"
import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export const Route = createFileRoute("/_app/reports")({
  component: () => (
    <ModulePlaceholder
      title="Reports"
      description="Monitor service levels, compliance trends, and council performance."
    />
  ),
})
