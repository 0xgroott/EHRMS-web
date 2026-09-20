import { createFileRoute } from "@tanstack/react-router"
import { MohSignInPage } from "@/features/moh/moh-pages"

export const Route = createFileRoute("/moh/sign-in")({
  component: MohSignInPage,
})
