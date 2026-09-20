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
import {
  certificateIsValid,
  latestCertificateApplication,
} from "@/domain/certificate-validity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { handlerReadiness } from "./fitness-rules"
import { useFitness } from "./fitness-context"
import type { FoodHandler } from "./fitness-types"

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
      render={<a href={href} />}
      variant={variant}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  )
}

function readinessBadge(handler: FoodHandler) {
  if (handler.archivedAt) return <Badge variant="outline">Archived</Badge>
  const readiness = handlerReadiness(handler)
  return readiness.ready ? (
    <Badge>Ready to apply</Badge>
  ) : (
    <Badge variant="outline">Needs details</Badge>
  )
}

function coverageLabel(
  handler: FoodHandler,
  activeHandlerIds: string[],
  certificateHandlerIds: string[],
  certificateValid: boolean
) {
  if (certificateHandlerIds.includes(handler.id))
    return certificateValid
      ? "Covered by Fitness certificate"
      : "Fitness certificate expired"
  return activeHandlerIds.includes(handler.id)
    ? "Included in active Fitness application"
    : "No Fitness coverage"
}

export function FoodHandlersPage() {
  const { state, isHydrated, setHandlerArchived } = useFitness()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<
    "current" | "ready" | "needs-details" | "archived"
  >("current")
  const [actionError, setActionError] = useState("")
  const currentHandlers = state.handlers.filter(
    (handler) => !handler.archivedAt
  )
  const eligibleHandlers = state.handlers.filter(
    (handler) => !handler.archivedAt && handlerReadiness(handler).ready
  )
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const visibleHandlers = state.handlers.filter((handler) => {
    const matchesSearch = `${handler.fullName} ${handler.role}`
      .toLocaleLowerCase()
      .includes(normalizedSearch)
    if (!matchesSearch) return false
    if (status === "archived") return Boolean(handler.archivedAt)
    if (handler.archivedAt) return false
    if (status === "ready") return handlerReadiness(handler).ready
    if (status === "needs-details") return !handlerReadiness(handler).ready
    return true
  })
  function changeArchiveStatus(handler: FoodHandler) {
    setActionError("")
    const archived = !handler.archivedAt
    const result = setHandlerArchived(handler.id, archived)
    if (!result.ok) return setActionError(result.error)
    notifySuccess(archived ? "Food handler archived" : "Food handler restored")
  }
  const application = state.application
  const certificate = latestCertificateApplication(
    application,
    state.history
  )?.certificate
  const certificateValid = certificate
    ? certificateIsValid(certificate.expiresAt)
    : false
  const applicationAction =
    application?.stage === "issued"
      ? {
          href: "/business/fitness/certificate",
          label: "View Fitness certificate",
        }
      : application &&
          application.stage !== "draft" &&
          application.stage !== "review"
        ? {
            href: "/business/fitness/tracker",
            label: "Track Fitness application",
          }
        : eligibleHandlers.length > 0
          ? {
              href: "/business/fitness/apply",
              label: "Start Fitness application",
            }
          : null

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
        eyebrow="Fitness Certificate"
        title="Food handlers"
        description="Keep current staff ready for Fitness applications and retain former staff records."
        actions={
          <AppLink href="/business/food-handler/new">
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add food handler
          </AppLink>
        }
      />

      {state.handlers.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRound aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No food handlers registered yet</EmptyTitle>
            <EmptyDescription>
              Add each person who handles food at this premises so they can be
              included in a Fitness Certificate application.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Food handler records</CardTitle>
            <CardDescription>
              {currentHandlers.length} current ·{" "}
              {state.handlers.length - currentHandlers.length} archived.
              Readiness requires identity, role, phone, and consent.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 gap-4">
            {actionError && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block w-full sm:max-w-xs">
                <span className="sr-only">Search food handlers</span>
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
                  <option value="current">Current staff</option>
                  <option value="ready">Ready to apply</option>
                  <option value="needs-details">Needs details</option>
                  <option value="archived">Archived staff</option>
                </select>
              </label>
            </div>
            <p role="status" className="text-sm text-muted-foreground">
              {visibleHandlers.length}{" "}
              {visibleHandlers.length === 1 ? "record" : "records"} shown
            </p>
            {visibleHandlers.length === 0 ? (
              <div className="rounded-lg border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">
                {status === "current" &&
                !search.trim() &&
                !currentHandlers.length
                  ? "No current staff. Choose Archived staff to restore a record, or add a food handler."
                  : "No food handlers match this search and status. Try another name or filter."}
              </div>
            ) : (
              <Table className="min-w-[42rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Food handler</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Fitness coverage</TableHead>
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
                      <TableCell>{readinessBadge(handler)}</TableCell>
                      <TableCell>
                        {coverageLabel(
                          handler,
                          application?.handlerIds ?? [],
                          certificate?.handlerIds ?? [],
                          certificateValid
                        )}
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
            )}
          </CardContent>
        </Card>
      )}

      {currentHandlers.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Next step</CardTitle>
            <CardDescription>
              {eligibleHandlers.length
                ? `${eligibleHandlers.length} ${eligibleHandlers.length === 1 ? "handler is" : "handlers are"} ready to be selected.`
                : "Complete the missing details and consent on a staff record before starting an application."}
            </CardDescription>
          </CardHeader>
          {applicationAction && (
            <CardContent>
              <AppLink href={applicationAction.href}>
                {applicationAction.label}
              </AppLink>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
