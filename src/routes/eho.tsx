import { createFileRoute, Outlet } from "@tanstack/react-router"
import { EhoProvider } from "@/features/eho/eho-session"

export const Route = createFileRoute("/eho")({
  component: () => (
    <EhoProvider>
      <Outlet />
    </EhoProvider>
  ),
})
