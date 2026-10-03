import { Building2, ClipboardCheck, ClipboardList } from "lucide-react"

export const mohNavigation = [
  {
    label: "Health approvals",
    href: "/moh/health-approvals",
    icon: ClipboardCheck,
  },
  { label: "Inspections", href: "/moh/inspections", icon: ClipboardList },
  { label: "Premises", href: "/moh/businesses", icon: Building2 },
] as const

export function isMohNavigationItemActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href === "/moh/health-approvals" &&
      pathname.startsWith("/moh/health-approvals/")) ||
    (href === "/moh/inspections" && pathname.startsWith("/moh/inspections/")) ||
    (href === "/moh/businesses" && pathname.startsWith("/moh/businesses/"))
  )
}
