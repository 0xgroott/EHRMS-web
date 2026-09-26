import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import { notifySuccess } from "@/components/ui/app-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
      <Dialog open onOpenChange={(open) => !open && close()}>
        <DialogContent className="h-[min(600px,calc(100dvh-2rem))] max-h-[600px] grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden rounded-xl p-0 sm:max-w-[456px]!">
          <DialogHeader className="px-6 pt-6 pr-14">
            <DialogTitle>Add staff</DialogTitle>
            <DialogDescription>
              Add the staff details needed for Fitness Certificate applications.
            </DialogDescription>
          </DialogHeader>
          <div className="staff-dialog-scroll mr-1 mb-2 min-h-0 overflow-y-auto px-6 pb-4">
            <FoodHandlerForm
              branchOptions={[branch]}
              onSave={(handler) => {
                addHandler(handler)
                notifySuccess("Staff member added")
                close()
              }}
              onCancel={close}
            />
          </div>
        </DialogContent>
      </Dialog>
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
          title={handler ? "Edit staff member" : "Staff member not found"}
          description={
            handler
              ? undefined
              : "Return to Staff to select an existing record."
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
                  notifySuccess("Staff member updated")
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
