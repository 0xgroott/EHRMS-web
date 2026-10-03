import { FileText, Image as ImageIcon } from "lucide-react"
import type { PremisesDocument, PremisesPhotoSummary } from "@/domain/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function PremisesDocumentsPanel({
  businessName,
  documents,
  photos,
}: {
  businessName: string
  documents: PremisesDocument[]
  photos: PremisesPhotoSummary[]
}) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <section aria-labelledby="supporting-documents-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="supporting-documents-title" className="text-lg font-semibold">
            Supporting documents
          </h2>
          <Badge variant="secondary">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((document) => (
            <Card key={document.id} size="sm">
              <CardContent className="flex-row items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{document.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {document.category} · Added {document.addedAt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="premises-photos-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="premises-photos-title" className="text-lg font-semibold">
            Premises and kitchen photos
          </h2>
          <Badge variant="secondary">
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </Badge>
        </div>
        <ul className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="min-w-0 overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10"
            >
              {photo.dataUrl ? (
                <img
                  src={photo.dataUrl}
                  alt={`${businessName} premises: ${photo.name}`}
                  className="aspect-[4/3] size-full object-cover"
                />
              ) : (
                <div
                  role="img"
                  aria-label={`${businessName} premises photo: ${photo.name}`}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-muted/40 p-4 text-center text-muted-foreground"
                >
                  <ImageIcon className="size-7" aria-hidden="true" />
                  <span className="text-xs">Photo on file</span>
                </div>
              )}
              <p
                className="truncate p-3 text-sm font-medium"
                title={photo.name}
              >
                {photo.name}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
