import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/lga/_portal/health-approvals")({
  beforeLoad: () => {
    throw redirect({
      to: "/lga/premises",
      search: { approval: "all" },
      replace: true,
    })
  },
})
