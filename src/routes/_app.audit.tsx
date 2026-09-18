import { createFileRoute } from "@tanstack/react-router"; import { ModulePlaceholder } from "@/components/shared/module-placeholder"
export const Route = createFileRoute("/_app/audit")({ component: () => <ModulePlaceholder title="Audit trail" description="Review traceable activity across records and decisions."/> })
