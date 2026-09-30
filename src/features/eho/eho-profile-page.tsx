import { LogOut, UserRound } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEho } from "./eho-session"

export function EhoProfilePage() {
  const { officer, signOut } = useEho()

  if (!officer) return null
  const council = seedDatabase.councils.find(
    (item) => item.id === officer.councilId
  )

  function leave() {
    if (signOut()) window.location.assign("/")
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="Officer account"
        title="Profile"
        description="Review your assigned account and session details."
      />
      <Card>
        <CardHeader>
          <CardTitle
            role="heading"
            aria-level={2}
            className="flex items-center gap-2 text-base"
          >
            <UserRound className="size-5 text-primary" aria-hidden="true" />
            Assigned account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            <div className="py-3 first:pt-0">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium">{officer.name}</dd>
            </div>
            <div className="py-3">
              <dt className="text-muted-foreground">Staff ID</dt>
              <dd className="mt-1 font-medium">{officer.id}</dd>
            </div>
            <div className="py-3">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-1 font-medium">Environmental Health Officer</dd>
            </div>
            <div className="py-3">
              <dt className="text-muted-foreground">Council</dt>
              <dd className="mt-1 font-medium">
                {council ? `${council.name} Council` : "Council unavailable"}
              </dd>
            </div>
            <div className="pt-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium break-all">{officer.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle
            role="heading"
            aria-level={2}
            className="flex items-center gap-2 text-base"
          >
            <LogOut className="size-5 text-primary" aria-hidden="true" />
            Session
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Signing out keeps saved work on this device for your next sign-in.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Sign out
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of EHRCMS?</AlertDialogTitle>
                <AlertDialogDescription>
                  Saved records stay on this device after sign-out and will be
                  available when you sign in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                <AlertDialogAction onClick={leave}>
                  Sign out anyway
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
