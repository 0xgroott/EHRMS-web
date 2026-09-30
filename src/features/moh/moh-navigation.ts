import { House } from "lucide-react"

export const mohNavigation = [
  { label: "Dashboard", href: "/moh/home", icon: House },
] as const

export function isMohNavigationItemActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href === "/moh/home" && pathname.startsWith("/moh/businesses/"))
  )
}
