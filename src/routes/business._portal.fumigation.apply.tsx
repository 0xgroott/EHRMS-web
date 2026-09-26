import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FumigationApplicationPage } from "@/features/fumigation/fumigation-application-page"

export const Route = createFileRoute("/business/_portal/fumigation/apply")({
  component: FumigationApplyRoute,
})

function FumigationApplyRoute() {
  const navigate = useNavigate()
  return (
    <FumigationApplicationPage
      onPaid={() => void navigate({ to: "/business/fumigation/tracker" })}
    />
  )
}
