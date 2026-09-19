import { createFileRoute } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import { FoodHandlerForm } from "@/features/fitness/food-handler-form"
import { useFitness } from "@/features/fitness/fitness-context"

function NewFoodHandlerRoute() {
  const { state: businessState } = useBusinessSession()
  const { addHandler } = useFitness()
  const premisesName =
    businessState.profile?.premises?.premisesName ?? "Current premises"

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Fitness Certificate"
        title="Add food handler"
        description="Record the details needed to include this person in a Fitness Certificate application."
      />
      <FoodHandlerForm
        premisesName={premisesName}
        onSave={(handler, destination) => {
          addHandler(handler)
          window.location.assign(
            destination === "another"
              ? "/business/food-handler/new"
              : "/business/food-handlers"
          )
        }}
        onCancel={() => window.location.assign("/business/food-handlers")}
      />
    </div>
  )
}

export const Route = createFileRoute("/business/_portal/food-handler/new")({
  component: NewFoodHandlerRoute,
})
