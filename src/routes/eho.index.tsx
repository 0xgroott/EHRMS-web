import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/eho/")({
  beforeLoad: () => {
    throw redirect({ to: "/eho/sign-in" })
  },
})
