import { Clock3 } from "lucide-react"
import { PageHeader } from "./page-header"

export function ModulePlaceholder({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="EHRCMS module"
        title={title}
        description={description}
      />
      <div className="grid min-h-[360px] place-items-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Clock3 />
          </span>
          <h2 className="mt-4 text-lg font-semibold">
            Workflow foundation ready
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This module is represented in navigation and access control. Its
            end-to-end operational workflow is scheduled for the next
            implementation phase.
          </p>
        </div>
      </div>
    </div>
  )
}
