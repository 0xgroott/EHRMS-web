import { createFileRoute } from "@tanstack/react-router"
import { LgaSignInPage } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/sign-in")({
  component: LgaSignInPage,
})
