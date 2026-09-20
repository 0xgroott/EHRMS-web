import { createFileRoute, Outlet } from "@tanstack/react-router"
import { MohProvider } from "@/features/moh/moh-session"

export const Route = createFileRoute("/moh")({
  component: () => (
    <MohProvider>
      <Outlet />
    </MohProvider>
  ),
})
