import { createFileRoute } from "@tanstack/react-router"
import { BusinessPortalAccess } from "@/components/business/business-portal-access"
import { FumigationProvider } from "@/features/fumigation/fumigation-context"
import { FumigationPaymentReceiptPage } from "@/features/fumigation/fumigation-payment-receipt-page"

export const Route = createFileRoute("/business/fumigation/payment-receipt")({
  component: FumigationPaymentReceiptRoute,
})

function FumigationPaymentReceiptRoute() {
  return (
    <BusinessPortalAccess>
      <FumigationProvider>
        <FumigationPaymentReceiptPage />
      </FumigationProvider>
    </BusinessPortalAccess>
  )
}
