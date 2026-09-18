import { createFileRoute } from "@tanstack/react-router"; import { ModulePlaceholder } from "@/components/shared/module-placeholder"
export const Route = createFileRoute("/_app/system")({ component: () => <ModulePlaceholder title="Council administration" description="Manage councils and system-wide governance settings."/> })
