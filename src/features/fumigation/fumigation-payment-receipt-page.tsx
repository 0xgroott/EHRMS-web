import { useBusinessSession } from "@/app/business-session"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  paymentReceiptDocument,
  renderBusinessDocument,
} from "@/domain/business-document-downloads"
import { useFumigation } from "./fumigation-context"
import { FumigationLoading } from "./fumigation-shared"

export function FumigationPaymentReceiptPage() {
  const { state, isHydrated } = useFumigation()
  const { state: businessState } = useBusinessSession()

  if (!isHydrated) return <FumigationLoading />

  const document = state.application
    ? paymentReceiptDocument(
        "Fumigation",
        state.application,
        businessState.profile
      )
    : null

  if (!document) {
    return (
      <main className="grid min-h-svh place-items-center p-6">
        <Empty className="max-w-lg border">
          <EmptyHeader>
            <EmptyTitle>Payment receipt unavailable</EmptyTitle>
            <EmptyDescription>
              A confirmed payment reference is required to view this receipt.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh flex-col bg-muted/40 p-3 md:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3">
        <header className="flex flex-col justify-between gap-3 rounded-xl bg-background p-4 ring-1 ring-foreground/10 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              EHRCMS document viewer
            </p>
            <h1 className="mt-1 text-xl font-semibold">{document.title}</h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              Reference: {document.reference}
            </p>
          </div>
          <DocumentDownloadButton document={document} variant="default">
            Download receipt
          </DocumentDownloadButton>
        </header>
        <iframe
          title={`${document.title} document`}
          srcDoc={renderBusinessDocument(document)}
          sandbox=""
          className="min-h-[42rem] w-full flex-1 rounded-xl bg-background ring-1 ring-foreground/10"
        />
      </div>
    </main>
  )
}
