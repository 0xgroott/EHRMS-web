import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export type AutosaveState = "idle" | "saving" | "saved" | "error"

type AutosaveStatusProps = {
  state: AutosaveState
  onRetry: () => void
}

export function AutosaveStatus({ state, onRetry }: AutosaveStatusProps) {
  if (state === "idle") return null

  if (state === "error") {
    return (
      <Alert variant="destructive" role="status" aria-live="polite">
        <AlertDescription className="flex items-center justify-between gap-3">
          <span>Couldn't save your draft.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="min-h-11 shrink-0"
          >
            Retry save
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <p
      className="text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {state === "saving" ? "Saving…" : "Saved"}
    </p>
  )
}
