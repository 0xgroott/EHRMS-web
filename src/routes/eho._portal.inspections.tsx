import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router"
import { EhoInspectionListPage } from "@/features/eho/eho-pages"

function InspectionsRoute() {
  const pathname = useLocation({ select: (location) => location.pathname })
  return pathname.replace(/\/$/, "") === "/eho/inspections" ? (
    <EhoInspectionListPage />
  ) : (
    <Outlet />
  )
}

export const Route = createFileRoute("/eho/_portal/inspections")({
  component: InspectionsRoute,
})
