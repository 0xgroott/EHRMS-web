import { createFileRoute } from "@tanstack/react-router"
import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export const Route = createFileRoute("/_app/applications")({
  component: () => (
    <ModulePlaceholder
      title="Applications"
      description="Review, validate, and progress public-health applications."
    />
  ),
})
