import { useId, useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type {
  BusinessProfile,
  BusinessProfileDetailsInput,
} from "@/domain/business-types"
import { validateProfileDetails } from "@/domain/business-validation"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

const fields: { name: keyof BusinessProfileDetailsInput; label: string }[] = [
  { name: "businessName", label: "Registered business name" },
  { name: "contactName", label: "Contact person" },
  { name: "premisesName", label: "Premises name" },
  { name: "businessType", label: "Business type" },
  { name: "registrationNumber", label: "Registration number (optional)" },
  { name: "address", label: "Address" },
  { name: "ward", label: "Ward" },
]

function detailsFromProfile(
  profile: BusinessProfile
): BusinessProfileDetailsInput {
  const premises = profile.premises!
  return {
    businessName: profile.businessName,
    contactName: profile.contactName,
    premisesName: premises.premisesName,
    businessType: premises.businessType,
    registrationNumber: premises.registrationNumber ?? "",
    address: premises.address,
    ward: premises.ward,
  }
}

export function BusinessProfileEditDrawer({
  profile,
  councilName,
  onClose,
  onSaved,
}: {
  profile: BusinessProfile
  councilName: string
  onClose: () => void
  onSaved: () => void
}) {
  const id = useId()
  const { refresh } = useBusinessSession()
  const [values, setValues] = useState(() => detailsFromProfile(profile))
  const [touched, setTouched] = useState<
    Partial<Record<keyof BusinessProfileDetailsInput, boolean>>
  >({})
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const original = detailsFromProfile(profile)
  const dirty = fields.some(
    ({ name }) => (values[name] ?? "").trim() !== (original[name] ?? "").trim()
  )
  const errors = validateProfileDetails(values)
  const valid = !Object.values(errors).some(Boolean)

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dirty || !valid || saving) return
    setSaving(true)
    setSaveError("")
    try {
      const result = createBusinessRepository(
        createBusinessStorage()
      ).updateProfileDetails(values)
      if (!result.ok) {
        setSaveError(
          Object.values(result.errors).find(Boolean) ?? "Unable to save changes"
        )
        return
      }
      const refreshed = await refresh()
      if (!refreshed) {
        setSaveError("Changes were saved. Refresh the page to see them.")
        return
      }
      onSaved()
    } catch {
      setSaveError("Unable to save changes. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <BusinessFormDrawer
      title="Edit business profile"
      description="Update the details shown across your business account."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => void save(event)}
        className="flex max-w-2xl flex-col gap-8 pb-8"
      >
        <FieldGroup className="gap-5 sm:grid sm:grid-cols-2">
          {fields.map(({ name, label }) => {
            const error = touched[name] ? errors[name] : undefined
            const fieldId = `${id}-${name}`
            return (
              <Field
                key={name}
                data-invalid={!!error}
                className={name === "address" ? "sm:col-span-2" : undefined}
              >
                <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
                <Input
                  id={fieldId}
                  name={name}
                  value={values[name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  onBlur={() =>
                    setTouched((current) => ({ ...current, [name]: true }))
                  }
                  aria-invalid={!!error}
                  aria-describedby={error ? `${fieldId}-error` : undefined}
                  disabled={saving}
                  className="min-h-11"
                />
                {error && (
                  <FieldError id={`${fieldId}-error`}>{error}</FieldError>
                )}
              </Field>
            )
          })}
        </FieldGroup>
        <div className="border-t pt-5 text-sm text-muted-foreground">
          <p>
            Email, phone number, and council stay linked to your verified
            account.
          </p>
          <p className="mt-2">
            Council:{" "}
            <span className="font-medium text-foreground">{councilName}</span>
          </p>
        </div>
        {saveError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!dirty || !valid || saving}>
            {saving ? "Saving changes…" : "Save changes"}
          </Button>
        </div>
      </form>
    </BusinessFormDrawer>
  )
}
