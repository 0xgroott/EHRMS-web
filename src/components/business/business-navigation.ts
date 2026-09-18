import {
  ClipboardCheck,
  FileCheck2,
  Files,
  House,
  Store,
  UsersRound,
} from "lucide-react"

export const businessNavigation = [
  { label: "Home", href: "/business/dashboard", icon: House },
  { label: "Food handlers", href: "/business/food-handlers", icon: UsersRound },
  { label: "Applications", href: "/business/applications", icon: Files },
  { label: "Certificates", href: "/business/certificates", icon: FileCheck2 },
  { label: "Inspections", href: "/business/inspections", icon: ClipboardCheck },
  { label: "Business profile", href: "/business/profile", icon: Store },
] as const
