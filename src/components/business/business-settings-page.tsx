import { useEffect, useRef, useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { BusinessSetupForm } from "@/components/business/business-setup-form"
import { BusinessSettingsProfileCard } from "@/components/business/business-settings-profile-card"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFullscreenContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notifySuccess } from "@/components/ui/app-toast"
import type {
  BusinessPremisesInput,
  BusinessProfile,
} from "@/domain/business-types"
import { BusinessProfilePage } from "@/features/business-media/business-profile-page"
import { useFitness } from "@/features/fitness/fitness-context"
import { useFumigation } from "@/features/fumigation/fumigation-context"
import { useInspection } from "@/features/inspection/inspection-context"
import {
  readBusinessSettings,
  saveBusinessSettings,
} from "@/services/business-settings"
import { createBusinessRepository } from "@/services/business-repository"
import type { BusinessRepositoryResult } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { XIcon } from "lucide-react"

const emptyPremises: BusinessPremisesInput = {
  premisesName: "",
  businessType: "",
  registrationNumber: "",
  address: "",
  ward: "",
  councilId: "",
}

function resultError(result: BusinessRepositoryResult) {
  if (result.ok) return undefined
  return (
    Object.values(result.errors).find(
      (message): message is string => typeof message === "string"
    ) ?? "Unable to update your business verification. Please try again."
  )
}

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

function OwnerAccountSettings({ profile }: { profile: BusinessProfile }) {
  const { refresh } = useBusinessSession()
  const [ownerName, setOwnerName] = useState(profile.contactName)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function saveOwner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const contactName = ownerName.trim()
    if (!contactName) return setError("Enter the owner's full name")
    setSaving(true)
    setError("")
    const result = createBusinessRepository(
      createBusinessStorage()
    ).updateBusinessIdentity({
      businessName: profile.businessName,
      contactName,
    })
    const nextError = resultError(result)
    if (nextError) setError(nextError)
    else {
      await refresh()
      notifySuccess("Owner account updated")
    }
    setSaving(false)
  }

  return (
    <section aria-labelledby="settings-account" className="max-w-4xl">
      <h2 id="settings-account" className="text-lg font-semibold">
        Owner account
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        This is the single owner login used to manage the business workspace.
      </p>
      <form onSubmit={(event) => void saveOwner(event)} className="mt-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <label htmlFor="owner-name" className="text-sm font-medium">
              Owner name
            </label>
            <Input
              id="owner-name"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              disabled={saving}
              className="min-h-11"
            />
          </div>
          <AccountDetail
            id="account-email"
            label="Email address"
            value={profile.email}
          />
          {profile.phone.trim() && (
            <AccountDetail
              id="account-phone"
              label="Phone number"
              value={profile.phone}
            />
          )}
          <AccountDetail
            id="account-role"
            label="Workspace role"
            value="Business owner"
          />
        </div>
        {error && (
          <Alert variant="destructive" role="alert" className="mt-5">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
          {profile.phone.trim()
            ? "Changes to the verified email or phone require contact verification."
            : "Changes to the verified email require contact verification."}
        </p>
        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            disabled={saving || ownerName.trim() === profile.contactName}
          >
            {saving ? "Saving…" : "Save account"}
          </Button>
        </div>
      </form>
    </section>
  )
}

function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [setupOpen, setSetupOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [codeError, setCodeError] = useState("")

  function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwords.current)
      return setPasswordError("Enter your current password")
    if (passwords.next.length < 10)
      return setPasswordError("Use at least 10 characters")
    if (passwords.next !== passwords.confirm)
      return setPasswordError("New passwords do not match")
    setPasswordError("")
    setPasswords({ current: "", next: "", confirm: "" })
    notifySuccess("Password changed")
  }

  function enableTwoFactor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{6}$/.test(verificationCode)) {
      setCodeError("Enter a 6-digit verification code")
      return
    }
    setCodeError("")
    setTwoFactorEnabled(true)
    setSetupOpen(false)
    setVerificationCode("")
    notifySuccess("Two-factor authentication enabled")
  }

  return (
    <section
      aria-labelledby="settings-security"
      className="max-w-4xl space-y-10"
    >
      <div>
        <h2 id="settings-security" className="text-lg font-semibold">
          Password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use a strong password that is unique to this account.
        </p>
        <form onSubmit={changePassword} className="mt-6 max-w-2xl space-y-5">
          {[
            ["current", "Current password"],
            ["next", "New password"],
            ["confirm", "Confirm new password"],
          ].map(([name, label]) => (
            <div key={name} className="space-y-2">
              <label
                htmlFor={`password-${name}`}
                className="text-sm font-medium"
              >
                {label}
              </label>
              <Input
                id={`password-${name}`}
                type="password"
                value={passwords[name as keyof typeof passwords]}
                onChange={(event) =>
                  setPasswords((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
                }
                className="min-h-11"
              />
            </div>
          ))}
          {passwordError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit">Change password</Button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Two-factor authentication</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Add a verification code after your password when signing in.
        </p>
        <div className="mt-5 flex flex-col items-start gap-3 rounded-xl bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">
              {twoFactorEnabled
                ? "Two-factor authentication is enabled"
                : "Two-factor authentication is not enabled"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {twoFactorEnabled
                ? "A verification code will be requested at sign-in."
                : "Use an authenticator app to protect the owner account."}
            </p>
          </div>
          {!twoFactorEnabled && (
            <Button variant="outline" onClick={() => setSetupOpen(true)}>
              Set up two-factor authentication
            </Button>
          )}
        </div>
      </div>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan this code with your authenticator app, then enter the
              verification code it generates.
            </DialogDescription>
          </DialogHeader>
          <div
            role="img"
            aria-label="Authenticator setup code"
            className="mx-auto grid size-40 place-items-center rounded-lg border-8 border-foreground bg-background text-center text-xs font-semibold tracking-wider"
          >
            EHRCMS
            <br />
            2FA
          </div>
          <form onSubmit={enableTwoFactor} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="two-factor-code" className="text-sm font-medium">
                Verification code
              </label>
              <Input
                id="two-factor-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(event.target.value.replace(/\D/g, ""))
                }
                aria-invalid={!!codeError}
                aria-describedby={codeError ? "two-factor-error" : undefined}
              />
              {codeError && (
                <p id="two-factor-error" className="text-sm text-destructive">
                  {codeError}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Enable 2FA
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function useKybRoute() {
  const [active, setActive] = useState(
    () => globalThis.location.hash === "#kyb"
  )

  useEffect(() => {
    const update = () => setActive(globalThis.location.hash === "#kyb")
    globalThis.addEventListener("hashchange", update)
    return () => globalThis.removeEventListener("hashchange", update)
  }, [])

  return active
}

function clearKybRoute() {
  if (globalThis.location.hash !== "#kyb") return
  globalThis.history.replaceState(null, "", "/business/settings")
  globalThis.dispatchEvent(new HashChangeEvent("hashchange"))
}

function KybSettings({
  profile,
  onExit,
}: {
  profile: BusinessProfile
  onExit: () => void
}) {
  const { refresh } = useBusinessSession()
  const completing = useRef(false)
  const initialValues: BusinessPremisesInput = {
    ...emptyPremises,
    premisesName: profile.premises?.premisesName ?? profile.businessName,
    businessType: profile.premises?.businessType ?? "",
    registrationNumber: profile.premises?.registrationNumber ?? "",
    address: profile.premises?.address ?? "",
    ward: profile.premises?.ward ?? "",
    councilId: profile.premises?.councilId ?? "",
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onExit()}>
      <DialogFullscreenContent>
        <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <BusinessSetupForm
            initialValues={initialValues}
            initialDocuments={profile.documents}
            contactEmail={profile.email}
            heading={
              <div className="flex items-start justify-between gap-5">
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Complete business verification (KYB)
                  </DialogTitle>
                  <DialogDescription className="mt-2 max-w-2xl leading-6">
                    Add your business and premises details to access all
                    business services.
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Close business verification"
                      className="shrink-0"
                    />
                  }
                >
                  <XIcon aria-hidden="true" />
                </DialogClose>
              </div>
            }
            onSaveDraft={async (premises, documents) => {
              const result = createBusinessRepository(
                createBusinessStorage()
              ).savePremisesDraft(premises, documents)
              const error = resultError(result)
              if (error) return { error }
              await refresh()
            }}
            onComplete={async (premises, documents) => {
              if (completing.current) {
                return {
                  error: "Business verification is already being completed.",
                }
              }
              completing.current = true
              try {
                const result = createBusinessRepository(
                  createBusinessStorage()
                ).completeSetup(premises, documents)
                const error = resultError(result)
                if (error) return { error }
                await refresh()
                clearKybRoute()
                notifySuccess("Business verification completed")
              } catch {
                return {
                  error:
                    "Unable to complete business verification. Please try again.",
                }
              } finally {
                completing.current = false
              }
            }}
            onExit={onExit}
          />
        </div>
      </DialogFullscreenContent>
    </Dialog>
  )
}

function SettingsContent({
  profile,
  kybComplete,
  showKyb,
}: {
  profile: BusinessProfile
  kybComplete: boolean
  showKyb: boolean
}) {
  const kybAvailable = showKyb && !kybComplete
  const [activeTab, setActiveTab] = useState("profile")
  const [settings, setSettings] = useState(() =>
    readBusinessSettings(profile.id)
  )
  const [saved, setSaved] = useState(settings)
  const [error, setError] = useState("")
  const [resetOpen, setResetOpen] = useState(false)
  const { resetApplications: resetFitnessApplications } = useFitness()
  const { resetApplications: resetFumigationApplications } = useFumigation()
  const { resetInspection } = useInspection()
  const dirty =
    settings.applicationEmails !== saved.applicationEmails ||
    settings.inspectionEmails !== saved.inspectionEmails

  useEffect(() => {
    if (kybAvailable) setActiveTab("profile")
  }, [kybAvailable])

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

  function resetApplicationProgress() {
    resetFitnessApplications()
    resetFumigationApplications()
    resetInspection()
    setResetOpen(false)
    notifySuccess("Application progress reset")
  }

  return (
    <div className="flex w-full max-w-7xl min-w-0 flex-col pb-12">
      <PageHeader eyebrow="Business account" title="Settings" divided={false} />

      {kybAvailable && <KybSettings profile={profile} onExit={clearKybRoute} />}

      <div
        data-slot="business-settings-layout"
        className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:items-start"
      >
        <BusinessSettingsProfileCard profile={profile} />
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            clearKybRoute()
          }}
          className="min-w-0 gap-4"
        >
          <div className="w-full overflow-x-auto pb-1">
            <TabsList className="h-11! min-w-max justify-start">
              <TabsTrigger value="profile" className="flex-none px-4">
                Business profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex-none px-4">
                Account
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-none px-4">
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-none px-4">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-none px-4">
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>
          <div
            data-slot="business-settings-panel"
            className="min-h-80 min-w-0 rounded-xl border bg-card p-4 sm:p-6 lg:min-h-[31.5rem] lg:p-8"
          >
            <TabsContent value="profile" keepMounted>
              <BusinessProfilePage showPremisesDetails={kybComplete} />
            </TabsContent>
            <TabsContent value="account">
              <OwnerAccountSettings profile={profile} />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
            <TabsContent value="notifications">
              <section aria-labelledby="settings-notifications">
                <h2
                  id="settings-notifications"
                  className="text-lg font-semibold"
                >
                  Notification preferences
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Choose your email preferences. Notices and application status
                  remain available in the portal.
                </p>
                <form onSubmit={save} className="mt-7 max-w-3xl">
                  <div className="flex min-h-20 items-center gap-4 py-4">
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
                    <label
                      htmlFor="application-emails"
                      className="cursor-pointer"
                    >
                      <span className="block text-sm font-medium">
                        Application updates
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        Fitness and Fumigation progress and decisions.
                      </span>
                    </label>
                  </div>
                  <div className="flex min-h-20 items-center gap-4 py-4">
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
                    <label
                      htmlFor="inspection-emails"
                      className="cursor-pointer"
                    >
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
            <TabsContent value="advanced">
              <section
                aria-labelledby="settings-advanced"
                className="max-w-3xl"
              >
                <h2 id="settings-advanced" className="text-lg font-semibold">
                  Advanced settings
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage actions that affect application and inspection
                  progress.
                </p>
                <div className="mt-7 rounded-xl bg-muted/40 p-5">
                  <h3 className="font-medium">Application progress</h3>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Return certificate applications and Health Approval
                    inspection progress to the beginning. Your business profile
                    and staff will stay.
                  </p>
                  <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
                    <AlertDialogTrigger
                      render={<Button variant="outline" className="mt-5" />}
                    >
                      Reset application progress
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Reset application progress?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This clears Fitness and Fumigation applications,
                          certificates, and Health Approval inspection progress.
                          Your business profile and kitchen staff will stay.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={resetApplicationProgress}
                        >
                          Reset progress
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export function BusinessSettingsPage() {
  const { state, isHydrated } = useBusinessSession()
  const showKyb = useKybRoute()
  if (!isHydrated) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading business settings</span>
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!state.profile) return null
  const kybComplete =
    state.stage === "complete" && Boolean(state.profile.premises)
  return (
    <SettingsContent
      profile={state.profile}
      kybComplete={kybComplete}
      showKyb={showKyb}
    />
  )
}
