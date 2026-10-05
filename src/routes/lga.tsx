import { createFileRoute, Outlet } from "@tanstack/react-router"
import { LgaProvider } from "@/features/lga/lga-session"

export const Route = createFileRoute("/lga")({
  component: () => (
    <LgaProvider>
      <Outlet />
    </LgaProvider>
  ),
})
