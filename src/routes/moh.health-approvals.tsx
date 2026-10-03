import { createFileRoute } from "@tanstack/react-router"
import { MohHealthApprovalsPage } from "@/features/moh/moh-pages"

export const Route = createFileRoute("/moh/health-approvals")({
  component: MohHealthApprovalsPage,
})
