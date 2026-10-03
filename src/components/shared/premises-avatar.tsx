import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "cn"

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export function PremisesAvatar({
  name,
  ariaLabel = `${name} premises`,
  display = "default",
}: {
  name: string
  ariaLabel?: string
  display?: "default" | "profile"
}) {
  return (
    <Avatar
      size={display === "profile" ? "2xl" : "lg"}
      role="img"
      aria-label={ariaLabel}
      className={cn(display === "profile" && "ring-4 ring-card")}
    >
      <AvatarFallback
        className={cn(
          "bg-primary/10 font-semibold text-primary",
          display === "profile" && "text-xl"
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
