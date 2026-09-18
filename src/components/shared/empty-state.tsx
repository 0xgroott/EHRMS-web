import { SearchX } from "lucide-react"

export function EmptyState({
  title = "No matching records",
  description = "Try changing your filters or search terms.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="grid min-h-56 place-items-center rounded-lg border border-dashed p-8 text-center">
      <div>
        <SearchX className="mx-auto size-7 text-muted-foreground" />
        <h3 className="mt-3 font-medium">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
