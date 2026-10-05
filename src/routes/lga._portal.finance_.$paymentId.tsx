import { createFileRoute } from "@tanstack/react-router"
import { LgaPaymentDetail } from "@/features/lga/lga-payment-detail"
import { validateFinanceSearch } from "@/features/lga/lga-finance-filters"

export const Route = createFileRoute("/lga/_portal/finance_/$paymentId")({
  validateSearch: validateFinanceSearch,
  component: Page,
})
function Page() {
  const { paymentId } = Route.useParams()
  return <LgaPaymentDetail paymentId={paymentId} />
}
