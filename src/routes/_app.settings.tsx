import { createFileRoute } from "@tanstack/react-router"
import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <ModulePlaceholder
      title="Settings"
      description="Configure operational rules and reference data."
    />
  ),
})
