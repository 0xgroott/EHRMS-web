import { createFileRoute, Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/business/_portal/profile")({
  component: () => <Navigate to="/business/settings" replace />,
})
