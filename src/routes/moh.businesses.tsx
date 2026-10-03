import { createFileRoute } from "@tanstack/react-router"
import { MohBusinessesPage } from "@/features/moh/moh-pages"

export const Route = createFileRoute("/moh/businesses")({
  component: MohBusinessesPage,
})
