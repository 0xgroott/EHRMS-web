import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import { notifySuccess } from "@/components/ui/app-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FoodHandlerForm } from "./food-handler-form"
import type { BusinessBranchOption } from "./food-handler-form"
import { FoodHandlersPage } from "./food-handlers-page"
import { useFitness } from "./fitness-context"

function branchOption(name: string, ward?: string): BusinessBranchOption {
  return { value: name, label: ward ? `${name}, ${ward}` : name }
}

export function NewFoodHandlerDrawerPage() {
  const navigate = useNavigate()
  const { state: businessState } = useBusinessSession()
  const { addHandler } = useFitness()
  const premises = businessState.profile?.premises
  const branch = branchOption(
    premises?.premisesName ?? "Current premises",
    premises?.ward
  )
  const close = () => void navigate({ to: "/business/food-handlers" })

  return (
    <>
      <FoodHandlersPage />
      <BusinessFormDrawer
        title="Add food handler"
        compactPadding
        onClose={close}
      >
        <FoodHandlerForm
          branchOptions={[branch]}
          onSave={(handler) => {
            addHandler(handler)
            notifySuccess("Food handler added")
            close()
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
  const { state: businessState } = useBusinessSession()
  const { state, isHydrated, updateHandler } = useFitness()
  const handler = state.handlers.find((record) => record.id === handlerId)
  const premises = businessState.profile?.premises
  const close = () => void navigate({ to: "/business/food-handlers" })

  return (
    <>
      <FoodHandlersPage />
      {isHydrated && (
        <BusinessFormDrawer
          title={handler ? "Edit food handler" : "Food handler not found"}
          description={
            handler
              ? undefined
              : "Return to food handlers to select an existing staff record."
          }
          compactPadding
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
              branchOptions={[
                branchOption(
                  handler.premisesName,
                  premises?.premisesName === handler.premisesName
                    ? premises.ward
                    : undefined
                ),
              ]}
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
