import { useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notifySuccess } from "@/components/ui/app-toast"
import { seedDatabase } from "@/data/seeds"
import type { BusinessProfile } from "@/domain/business-types"
import { BusinessProfilePage } from "@/features/business-media/business-profile-page"
import {
  readBusinessSettings,
  saveBusinessSettings,
} from "@/services/business-settings"

function AccountDetail({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        readOnly
        className="min-h-11 bg-muted/40 shadow-none"
      />
    </div>
  )
}

function SettingsContent({ profile }: { profile: BusinessProfile }) {
  const [settings, setSettings] = useState(() =>
    readBusinessSettings(profile.id)
  )
  const [saved, setSaved] = useState(settings)
  const [error, setError] = useState("")
  const council = seedDatabase.councils.find(
    (item) => item.id === profile.premises?.councilId
  )
  const dirty =
    settings.applicationEmails !== saved.applicationEmails ||
    settings.inspectionEmails !== saved.inspectionEmails

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dirty) return
    try {
      saveBusinessSettings(profile.id, settings)
      setSaved(settings)
      setError("")
      notifySuccess("Notification preferences saved")
    } catch {
      setError("Unable to save preferences. Try again.")
    }
  }

  return (
    <div className="flex w-full max-w-5xl min-w-0 flex-col pb-12">
      <PageHeader
        eyebrow="Business account"
        title="Business settings"
        description="Manage your business profile, account details, and notifications."
      />

      <Tabs defaultValue="profile" className="mt-4 min-w-0">
        <div className="mb-8 w-full overflow-x-auto">
          <TabsList
            variant="line"
            className="h-11! w-full! min-w-max! justify-start gap-1 rounded-none border-b p-0"
          >
            <TabsTrigger
              value="profile"
              className="min-h-11 flex-none rounded-none border-b-2 border-b-transparent px-4 transition-none after:hidden data-active:border-b-primary"
            >
              Business profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="min-h-11 flex-none rounded-none border-b-2 border-b-transparent px-4 transition-none after:hidden data-active:border-b-primary"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="min-h-11 flex-none rounded-none border-b-2 border-b-transparent px-4 transition-none after:hidden data-active:border-b-primary"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profile" keepMounted>
          <BusinessProfilePage />
        </TabsContent>
        <TabsContent value="account">
          <section
            aria-labelledby="settings-account"
            className="max-w-4xl space-y-5"
          >
            <div>
              <h2 id="settings-account" className="text-lg font-semibold">
                Account details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These details identify your verified account and registered
                council.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AccountDetail
                id="account-email"
                label="Email address"
                value={profile.email}
              />
              <AccountDetail
                id="account-phone"
                label="Phone number"
                value={profile.phone}
              />
              <AccountDetail
                id="account-council"
                label="Council"
                value={
                  council?.name ?? profile.premises?.councilId ?? "Not recorded"
                }
              />
              <AccountDetail
                id="account-reference"
                label="Business reference"
                value={profile.id}
              />
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              To change your verified email or phone, you must verify the new
              contact first. A council change requires a review of your premises
              assignment. Contact your council to request either change.
            </p>
          </section>
        </TabsContent>
        <TabsContent value="notifications">
          <section aria-labelledby="settings-notifications">
            <h2 id="settings-notifications" className="text-lg font-semibold">
              Notification preferences
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Choose your email preferences. Notices and application status
              remain available in the portal.
            </p>
            <form onSubmit={save} className="mt-7 max-w-3xl">
              <div className="flex min-h-20 items-center gap-4 border-t py-4">
                <input
                  type="checkbox"
                  id="application-emails"
                  checked={settings.applicationEmails}
                  onChange={(event) => {
                    setSettings((current) => ({
                      ...current,
                      applicationEmails: event.target.checked,
                    }))
                  }}
                  className="size-5 shrink-0 accent-primary"
                />
                <label htmlFor="application-emails" className="cursor-pointer">
                  <span className="block text-sm font-medium">
                    Application updates
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Fitness and Fumigation progress and decisions.
                  </span>
                </label>
              </div>
              <div className="flex min-h-20 items-center gap-4 border-y py-4">
                <input
                  type="checkbox"
                  id="inspection-emails"
                  checked={settings.inspectionEmails}
                  onChange={(event) => {
                    setSettings((current) => ({
                      ...current,
                      inspectionEmails: event.target.checked,
                    }))
                  }}
                  className="size-5 shrink-0 accent-primary"
                />
                <label htmlFor="inspection-emails" className="cursor-pointer">
                  <span className="block text-sm font-medium">
                    Inspection updates
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Inspection notices, findings, and follow-up actions.
                  </span>
                </label>
              </div>
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end pt-5">
                <Button type="submit" disabled={!dirty}>
                  Save preferences
                </Button>
              </div>
            </form>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function BusinessSettingsPage() {
  const { state, isHydrated } = useBusinessSession()
  if (!isHydrated) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading business settings</span>
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  return state.profile ? <SettingsContent profile={state.profile} /> : null
}
