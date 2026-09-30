import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export function EhoPremisesAvatar({ name }: { name: string }) {
  return (
    <Avatar size="lg" role="img" aria-label={`${name} avatar`}>
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
