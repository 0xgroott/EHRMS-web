import { PremisesAvatar } from "@/components/shared/premises-avatar"

export function EhoPremisesAvatar({ name }: { name: string }) {
  return <PremisesAvatar name={name} ariaLabel={`${name} avatar`} />
}
