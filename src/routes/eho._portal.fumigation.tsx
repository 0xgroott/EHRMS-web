import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router"
import { EhoFumigationListPage } from "@/features/eho/eho-fumigation-pages"

function FumigationRoute() {
  const pathname = useLocation({ select: (location) => location.pathname })
  return pathname.replace(/\/$/, "") === "/eho/fumigation" ? (
    <EhoFumigationListPage />
  ) : (
    <Outlet />
  )
}

export const Route = createFileRoute("/eho/_portal/fumigation")({
  component: FumigationRoute,
})
