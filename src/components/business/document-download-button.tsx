import { notifySuccess } from "@/components/ui/app-toast"
import { Button } from "@/components/ui/button"
import { downloadBusinessDocument } from "@/domain/business-document-downloads"
import type { PrintableBusinessDocument } from "@/domain/business-document-downloads"

export function DocumentDownloadButton({
  document,
  children,
  variant = "outline",
}: {
  document: PrintableBusinessDocument | null
  children: React.ReactNode
  variant?: "default" | "outline" | "link"
}) {
  if (!document) return null
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => {
        downloadBusinessDocument(document)
        notifySuccess(`${document.title} downloaded`)
      }}
    >
      {children}
    </Button>
  )
}
