import { Pencil, Plus, UsersRound } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
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
  const readiness = handlerReadiness(handler)
  return readiness.ready ? (
    <Badge>Ready to apply</Badge>
  ) : (
    <Badge variant="outline">Needs details</Badge>
  )
}

function coverageLabel(
  handler: FoodHandler,
  handlerIds: string[],
  stage?: string
) {
  if (!handlerIds.includes(handler.id)) return "No Fitness coverage"
  return stage === "issued"
    ? "Covered by Fitness certificate"
    : "Included in active Fitness application"
}

export function FoodHandlersPage() {
  const { state, isHydrated } = useFitness()
  const eligibleHandlers = state.handlers.filter(
    (handler) => handlerReadiness(handler).ready
  )
  const application = state.application
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
        description="Register the staff who handle food before starting a Fitness Certificate application."
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
            <CardTitle>Registered food handlers</CardTitle>
            <CardDescription>
              Readiness is based on the identity, role, phone number, and
              consent required for this demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {state.handlers.map((handler) => (
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
                        application?.stage
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AppLink
                        href={`/business/food-handler/${handler.id}`}
                        variant="link"
                        ariaLabel={`Edit ${handler.fullName}`}
                      >
                        <Pencil data-icon="inline-start" aria-hidden="true" />
                        Edit
                      </AppLink>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {state.handlers.length > 0 && (
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
