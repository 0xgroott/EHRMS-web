import { Bell, Search } from "lucide-react"
import { roleLabels, useDemoSession } from "@/app/demo-session"
import { seedDatabase } from "@/data/seeds"
import type { DemoRole } from "@/domain/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeMenuGroup } from "@/components/shared/theme-menu-group"

export function businessRoleHandoffPath(role: DemoRole) {
  if (role === "business-user") return "/business/dashboard"
  if (role === "eho") return "/eho/sign-in"
  return null
}

function navigateTo(path: string) {
  if (typeof window !== "undefined") {
    window.location.assign(path)
  }
}

export function handleDemoRoleSelection(
  role: DemoRole,
  setRole: (role: DemoRole) => void,
  navigate: (path: string) => void = navigateTo
) {
  setRole(role)

  const handoffPath = businessRoleHandoffPath(role)
  if (handoffPath) navigate(handoffPath)
}

export function AppHeader() {
  const { role, roleLabel, setRole, councilId, setCouncilId } = useDemoSession()
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search records, applications, premises…"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <label className="sr-only" htmlFor="council">
          Council
        </label>
        <select
          id="council"
          className="h-9 max-w-36 rounded-md border bg-background px-2 text-sm"
          value={councilId}
          onChange={(e) => setCouncilId(e.target.value)}
        >
          {seedDatabase.councils.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          aria-label="Role"
          className="h-9 max-w-40 rounded-md border bg-background px-2 text-sm"
          value={role}
          onChange={(event) => {
            const nextRole = event.target.value as DemoRole
            handleDemoRoleSelection(nextRole, setRole)
          }}
        >
          {Object.entries(roleLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="size-11" />}
            aria-label="Admin account"
          >
            <Avatar size="sm">
              <AvatarFallback>AO</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                Ada Okafor
                <span className="mt-0.5 block font-normal text-muted-foreground">
                  {roleLabel}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ThemeMenuGroup />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
