import { createFileRoute } from "@tanstack/react-router"
import { LgaApprovalsPage } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/health-approvals")({
  component: LgaApprovalsPage,
})
