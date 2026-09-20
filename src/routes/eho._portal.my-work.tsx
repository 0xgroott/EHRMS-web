import { createFileRoute } from "@tanstack/react-router"
import { EhoMyWorkPage } from "@/features/eho/eho-pages"

export const Route = createFileRoute("/eho/_portal/my-work")({
  component: EhoMyWorkPage,
})
