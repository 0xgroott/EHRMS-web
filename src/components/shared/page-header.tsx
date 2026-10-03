import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  actions,
  divided = true,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  actions?: React.ReactNode
  divided?: boolean
}) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
        divided && "border-b pb-6"
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
