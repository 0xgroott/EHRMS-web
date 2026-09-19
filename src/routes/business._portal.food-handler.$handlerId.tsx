import { createFileRoute } from "@tanstack/react-router"
import { EditFoodHandlerDrawerPage } from "@/features/fitness/food-handler-drawer-pages"

function EditFoodHandlerRoute() {
  const { handlerId } = Route.useParams()
  return <EditFoodHandlerDrawerPage handlerId={handlerId} />
}

export const Route = createFileRoute(
  "/business/_portal/food-handler/$handlerId"
)({
  component: EditFoodHandlerRoute,
})
