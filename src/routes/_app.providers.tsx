import { createFileRoute } from "@tanstack/react-router"
import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export const Route = createFileRoute("/_app/providers")({
  component: () => (
    <ModulePlaceholder
      title="Service providers"
      description="Manage accredited environmental-health service providers."
    />
  ),
})
