import { createFileRoute } from "@tanstack/react-router"; import { ModulePlaceholder } from "@/components/shared/module-placeholder"
export const Route = createFileRoute("/_app/inspections")({ component: () => <ModulePlaceholder title="Inspections" description="Schedule field work, record findings, and manage remediation."/> })
