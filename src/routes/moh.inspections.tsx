import { createFileRoute } from "@tanstack/react-router"
import { MohInspectionsPage } from "@/features/moh/moh-pages"

export const Route = createFileRoute("/moh/inspections")({
  component: MohInspectionsPage,
})
