import type { DemoRole, NavigationId } from "./types"

export type Capability =
  | "records:view"
  | "inspection:conduct"
  | "certificate:status-change"
  | "finance:manage"
  | "users:manage"
  | "settings:manage"
  | "audit:view"
  | "councils:manage"

const roleCapabilities: Record<DemoRole, readonly Capability[]> = {
  admin: ["records:view", "settings:manage", "audit:view"],
  "super-admin": [
    "records:view",
    "users:manage",
    "settings:manage",
    "audit:view",
    "councils:manage",
  ],
  eho: ["records:view", "inspection:conduct"],
  "moh-director": [
    "records:view",
    "certificate:status-change",
    "audit:view",
  ],
  "finance-officer": ["records:view", "finance:manage"],
  "business-user": ["records:view"],
}

const roleNavigation: Record<DemoRole, readonly NavigationId[]> = {
  admin: [
    "dashboard",
    "applications",
    "inspections",
    "premises",
    "certificates",
    "providers",
    "notices",
    "reports",
    "settings",
    "audit",
  ],
  "super-admin": [
    "dashboard",
    "applications",
    "inspections",
    "premises",
    "certificates",
    "providers",
    "finance",
    "notices",
    "reports",
    "users",
    "settings",
    "audit",
    "system",
  ],
  eho: ["dashboard", "inspections", "premises"],
  "moh-director": [
    "dashboard",
    "applications",
    "inspections",
    "premises",
    "certificates",
    "providers",
    "reports",
    "audit",
  ],
  "finance-officer": ["dashboard", "applications", "finance", "reports"],
  "business-user": [
    "dashboard",
    "applications",
    "inspections",
    "premises",
    "certificates",
  ],
}

export function can(role: DemoRole, capability: Capability) {
  return roleCapabilities[role].includes(capability)
}

export function visibleNavigation(role: DemoRole) {
  return [...roleNavigation[role]]
}
