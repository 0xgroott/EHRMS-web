import { createFileRoute } from "@tanstack/react-router"
import { EhoSignInPage } from "@/features/eho/eho-pages"

export const Route = createFileRoute("/eho/sign-in")({
  component: EhoSignInPage,
})
