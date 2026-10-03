import { BadgeCheck } from "lucide-react"
import { cn } from "cn"

export function VerifiedBusinessName({
  name,
  verified,
  className,
}: {
  name: string
  verified: boolean
  className?: string
}) {
  return (
    <span
      aria-label={name}
      className={cn("inline-flex min-w-0 items-center gap-1.5", className)}
    >
      <span className="min-w-0">{name}</span>
      {verified && (
        <BadgeCheck
          aria-label="KYB verified"
          className="size-[0.9em] shrink-0 text-primary"
        >
          <title>KYB verified</title>
        </BadgeCheck>
      )}
    </span>
  )
}
