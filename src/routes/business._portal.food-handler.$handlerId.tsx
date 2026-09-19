import { createFileRoute } from "@tanstack/react-router"
import { PageHeader } from "@/components/shared/page-header"
import { FoodHandlerForm } from "@/features/fitness/food-handler-form"
import { useFitness } from "@/features/fitness/fitness-context"

function EditFoodHandlerRoute() {
  const { handlerId } = Route.useParams()
  const { state, updateHandler } = useFitness()
  const handler = state.handlers.find((record) => record.id === handlerId)

  if (!handler) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Food handler not found"
          description="Return to food handlers to select an existing staff record."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Fitness Certificate"
        title="Edit food handler"
        description={`Update ${handler.fullName}'s details before starting a Fitness Certificate application.`}
      />
      <FoodHandlerForm
        handler={handler}
        premisesName={handler.premisesName}
        onSave={(next) => {
          updateHandler(handler.id, next)
          window.location.assign("/business/food-handlers")
        }}
        onCancel={() => window.location.assign("/business/food-handlers")}
      />
    </div>
  )
}

export const Route = createFileRoute(
  "/business/_portal/food-handler/$handlerId"
)({
  component: EditFoodHandlerRoute,
})
