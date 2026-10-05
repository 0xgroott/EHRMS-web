import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/lga/")({
  beforeLoad: () => {
    throw redirect({ to: "/lga/sign-in" })
  },
})
