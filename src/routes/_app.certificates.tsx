import { createFileRoute } from "@tanstack/react-router"; import { ModulePlaceholder } from "@/components/shared/module-placeholder"
export const Route = createFileRoute("/_app/certificates")({ component: () => <ModulePlaceholder title="Certificates" description="Issue and govern health approvals, fumigation, and fitness certificates."/> })
