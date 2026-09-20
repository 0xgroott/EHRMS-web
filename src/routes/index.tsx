import { createFileRoute } from "@tanstack/react-router"
import { WelcomePage } from "@/components/welcome-page"

export const Route = createFileRoute("/")({
  component: WelcomePage,
})
