import { createFileRoute } from "@tanstack/react-router"
import { BusinessPortalAccess } from "@/components/business/business-portal-access"
import { FitnessProvider } from "@/features/fitness/fitness-context"
import { FitnessPaymentReceiptPage } from "@/features/fitness/fitness-payment-receipt-page"

export const Route = createFileRoute("/business/fitness/payment-receipt")({
  component: FitnessPaymentReceiptRoute,
})

function FitnessPaymentReceiptRoute() {
  return (
    <BusinessPortalAccess>
      <FitnessProvider>
        <FitnessPaymentReceiptPage />
      </FitnessProvider>
    </BusinessPortalAccess>
  )
}
