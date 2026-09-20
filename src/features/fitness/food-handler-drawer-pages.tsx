import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import { notifySuccess } from "@/components/ui/app-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FoodHandlerForm } from "./food-handler-form"
import { FoodHandlersPage } from "./food-handlers-page"
import { useFitness } from "./fitness-context"

export function NewFoodHandlerDrawerPage() {
  const navigate = useNavigate()
  const [formKey, setFormKey] = useState(0)
  const { state: businessState } = useBusinessSession()
  const { addHandler } = useFitness()
  const premisesName =
    businessState.profile?.premises?.premisesName ?? "Current premises"
  const close = () => void navigate({ to: "/business/food-handlers" })

  return (
    <>
      <FoodHandlersPage />
      <BusinessFormDrawer
        title="Add food handler"
        description="Record the details needed to include this person in a Fitness Certificate application."
        onClose={close}
      >
        <FoodHandlerForm
          key={formKey}
          premisesName={premisesName}
          onSave={(handler, destination) => {
            addHandler(handler)
            notifySuccess("Food handler added")
            if (destination === "another") {
              setFormKey((current) => current + 1)
            } else {
              close()
            }
          }}
          onCancel={close}
        />
      </BusinessFormDrawer>
    </>
  )
}

export function EditFoodHandlerDrawerPage({
  handlerId,
}: {
  handlerId: string
}) {
  const navigate = useNavigate()
  const [saveError, setSaveError] = useState("")
  const { state, isHydrated, updateHandler } = useFitness()
  const handler = state.handlers.find((record) => record.id === handlerId)
  const close = () => void navigate({ to: "/business/food-handlers" })

  return (
    <>
      <FoodHandlersPage />
      {isHydrated && (
        <BusinessFormDrawer
          title={handler ? "Edit food handler" : "Food handler not found"}
          description={
            handler
              ? `Update ${handler.fullName}'s details before starting a Fitness Certificate application.`
              : "Return to food handlers to select an existing staff record."
          }
          onClose={close}
        >
          {saveError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          {handler && (
            <FoodHandlerForm
              handler={handler}
              premisesName={handler.premisesName}
              onSave={(next) => {
                const result = updateHandler(handler.id, next)
                if (result.ok) {
                  notifySuccess("Food handler updated")
                  close()
                } else setSaveError(result.error)
              }}
              onCancel={close}
            />
          )}
        </BusinessFormDrawer>
      )}
    </>
  )
}
