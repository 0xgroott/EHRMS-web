import type { ComponentProps, MouseEvent as ReactMouseEvent } from "react"
import { cn } from "cn"
import { TableRow } from "@/components/ui/table"

const interactiveSelector =
  'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [tabindex], [contenteditable="true"]'

function openRowLink(event: ReactMouseEvent<HTMLTableRowElement>) {
  if (event.defaultPrevented || event.button > 1) return
  const row = event.currentTarget
  const target = event.target
  if (!(target instanceof Element)) return
  const control = target.closest(interactiveSelector)
  if (control && row.contains(control)) return
  if (window.getSelection()?.toString()) return

  // Delegate to the existing link so router navigation, targets, downloads,
  // and modified clicks retain the same behavior as the visible action.
  const actions = row.querySelectorAll(interactiveSelector)
  const link = actions[0]
  if (
    actions.length !== 1 ||
    !(link instanceof HTMLAnchorElement) ||
    !link.hasAttribute("href") ||
    link.getAttribute("aria-disabled") === "true" ||
    link.hasAttribute("data-disabled")
  )
    return

  event.preventDefault()
  // Browsers do not apply new-tab defaults to synthetic modified clicks.
  if (event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey) {
    window.open(link.href, "_blank", "noopener,noreferrer")
    return
  }
  link.dispatchEvent(
    new MouseEvent(event.type, {
      bubbles: true,
      cancelable: true,
      button: event.button,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    })
  )
}

/** Use only for data rows whose sole action is a navigation link. */
export function LinkedTableRow({
  className,
  onClick,
  onAuxClick,
  ...props
}: ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      {...props}
      className={cn(
        "focus-within:bg-muted/50 has-[a[href]]:cursor-pointer",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        openRowLink(event)
      }}
      onAuxClick={(event) => {
        onAuxClick?.(event)
        openRowLink(event)
      }}
    />
  )
}
