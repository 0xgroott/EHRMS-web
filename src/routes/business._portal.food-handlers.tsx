import { createFileRoute } from "@tanstack/react-router"
import { FoodHandlersPage } from "@/features/fitness/food-handlers-page"

export const Route = createFileRoute("/business/_portal/food-handlers")({
  component: FoodHandlersPage,
})
