import { Link } from "@tanstack/react-router"
import { useState } from "react"
import {
  Archive,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  UsersRound,
} from "lucide-react"
import { notifySuccess } from "@/components/ui/app-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fitnessTestStatus } from "./fitness-test-status"
import type { FitnessTestStatus } from "./fitness-test-status"
import { useFitness } from "./fitness-context"
import type { FoodHandler } from "./fitness-types"

function FitnessTestBadge({ status }: { status: FitnessTestStatus }) {
  const variants = {
    Approved: "success",
    "In progress": "warning",
    Expired: "destructive",
    "Not approved": "secondary",
  } as const
  return <Badge variant={variants[status]}>{status}</Badge>
}

function AppLink({
  href,
  children,
  variant = "default",
  ariaLabel,
}: {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline" | "link"
  ariaLabel?: string
}) {
  return (
    <Button
      nativeButton={false}
      role="link"
      render={<Link to={href.split("#")[0]} hash={href.split("#")[1]} />}
      variant={variant}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  )
}

export function FoodHandlersPage() {
  const { state, isHydrated, setHandlerArchived } = useFitness()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"active" | "archived">("active")
  const [actionError, setActionError] = useState("")
  const currentHandlers = state.handlers.filter(
    (handler) => !handler.archivedAt
  )
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const visibleHandlers = state.handlers.filter((handler) => {
    const matchesSearch = `${handler.fullName} ${handler.role}`
      .toLocaleLowerCase()
      .includes(normalizedSearch)
    if (!matchesSearch) return false
    return status === "archived"
      ? Boolean(handler.archivedAt)
      : !handler.archivedAt
  })
  function changeArchiveStatus(handler: FoodHandler) {
    setActionError("")
    const archived = !handler.archivedAt
    const result = setHandlerArchived(handler.id, archived)
    if (!result.ok) return setActionError(result.error)
    notifySuccess(archived ? "Staff member archived" : "Staff member restored")
  }

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <PageHeader
        divided={false}
        eyebrow="Fitness Certificate"
        title="Staff"
        description="Manage active and archived staff records for Fitness applications."
        actions={
          <AppLink href="/business/food-handler/new">
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add staff
          </AppLink>
        }
      />

      {state.handlers.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRound aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No staff registered yet</EmptyTitle>
            <EmptyDescription>
              Add each person who handles food at this premises so they can be
              included in a Fitness Certificate application.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <section
          aria-label="Staff list"
          className="flex min-w-0 flex-col gap-4"
        >
          {actionError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">Search staff</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or role"
                className="pl-9"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">Show</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as typeof status)
                }
                className="h-9 min-w-40 rounded-md border border-input bg-background px-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {visibleHandlers.length}{" "}
            {visibleHandlers.length === 1 ? "record" : "records"} shown
          </p>
          {visibleHandlers.length === 0 ? (
            <div className="rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
              {status === "active" && !search.trim() && !currentHandlers.length
                ? "No active staff. Choose Archived to restore a record, or add a staff member."
                : "No staff match this search and status. Try another name or filter."}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <Table className="min-w-[42rem] bg-card">
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fitness test</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleHandlers.map((handler) => (
                    <TableRow key={handler.id}>
                      <TableCell className="font-medium">
                        {handler.fullName}
                      </TableCell>
                      <TableCell>{handler.role || "Not recorded"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={handler.archivedAt ? "outline" : "secondary"}
                        >
                          {handler.archivedAt ? "Archived" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <FitnessTestBadge
                          status={fitnessTestStatus(state, handler.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!handler.archivedAt && (
                            <AppLink
                              href={`/business/food-handler/${handler.id}`}
                              variant="link"
                              ariaLabel={`Edit ${handler.fullName}`}
                            >
                              <Pencil
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                              Edit
                            </AppLink>
                          )}
                          <Button
                            type="button"
                            variant="link"
                            aria-label={`${handler.archivedAt ? "Restore" : "Archive"} ${handler.fullName}`}
                            onClick={() => changeArchiveStatus(handler)}
                          >
                            {handler.archivedAt ? (
                              <RotateCcw
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                            ) : (
                              <Archive
                                data-icon="inline-start"
                                aria-hidden="true"
                              />
                            )}
                            {handler.archivedAt ? "Restore" : "Archive"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
