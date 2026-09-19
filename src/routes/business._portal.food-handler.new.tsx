import { createFileRoute } from "@tanstack/react-router"
import { NewFoodHandlerDrawerPage } from "@/features/fitness/food-handler-drawer-pages"

export const Route = createFileRoute("/business/_portal/food-handler/new")({
  component: NewFoodHandlerDrawerPage,
})
