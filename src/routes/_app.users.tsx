import { createFileRoute } from "@tanstack/react-router"
import { ModulePlaceholder } from "@/components/shared/module-placeholder"

export const Route = createFileRoute("/_app/users")({
  component: () => (
    <ModulePlaceholder
      title="Users"
      description="Administer staff accounts, roles, and council assignments."
    />
  ),
})
