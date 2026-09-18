import { createFileRoute } from "@tanstack/react-router"; import { ModulePlaceholder } from "@/components/shared/module-placeholder"
export const Route = createFileRoute("/_app/notices")({ component: () => <ModulePlaceholder title="Notices" description="Prepare and track statutory notices and enforcement communications."/> })
