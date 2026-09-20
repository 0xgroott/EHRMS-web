import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/moh/")({
  beforeLoad: () => {
    throw redirect({ to: "/moh/sign-in" })
  },
})
