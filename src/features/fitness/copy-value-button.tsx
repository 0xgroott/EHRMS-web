import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyValueButton({
  value,
  label,
}: {
  value: string
  label: string
}) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    []
  )

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value)
      setCopyFailed(false)
      setCopied(true)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => {
        setCopied(false)
        resetTimer.current = null
      }, 3000)
    } catch {
      setCopyFailed(true)
    }
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => void copyValue()}
        aria-label={`${copied ? "Copied" : "Copy"} ${label}`}
        title={`${copied ? "Copied" : "Copy"} ${label}`}
      >
        <span className="relative size-4">
          <Copy
            aria-hidden="true"
            className={cn(
              "fitness-copy-icon absolute inset-0 transition-[opacity,transform] duration-200",
              copied ? "scale-75 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <Check
            aria-hidden="true"
            className={cn(
              "fitness-copy-icon absolute inset-0 transition-[opacity,transform] duration-200",
              copied ? "scale-100 opacity-100" : "scale-75 opacity-0"
            )}
          />
        </span>
      </Button>
      {copyFailed && (
        <span role="alert" className="text-xs text-destructive">
          Could not copy
        </span>
      )}
    </span>
  )
}
