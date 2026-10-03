import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/moh/home")({
  beforeLoad: () => {
    throw redirect({ to: "/moh/health-approvals" })
  },
})
