import {
  Activity,
  BadgeCheck,
  Banknote,
  Building2,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  Landmark,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import type { NavigationId } from "@/domain/types"

export const navigation = [
  ["dashboard", "Dashboard", "/dashboard", Gauge],
  ["applications", "Applications", "/applications", FileCheck2],
  ["inspections", "Inspections", "/inspections", ClipboardCheck],
  ["premises", "Premises", "/premises", Building2],
  ["certificates", "Certificates", "/certificates", BadgeCheck],
  ["providers", "Service providers", "/providers", Users],
  ["finance", "Finance", "/finance", Banknote],
  ["notices", "Notices", "/notices", Megaphone],
  ["reports", "Reports", "/reports", Activity],
  ["users", "Users", "/users", ShieldCheck],
  ["settings", "Settings", "/settings", Settings],
  ["audit", "Audit trail", "/audit", FileCheck2],
  ["system", "Council administration", "/system", Landmark],
] as const satisfies readonly (readonly [
  NavigationId,
  string,
  string,
  typeof Gauge,
])[]
