import { useId, useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { notifySuccess } from "@/components/ui/app-toast"
import type {
  BusinessIdentityInput,
  BusinessProfile,
  BusinessProfileDetailsInput,
  BusinessProfileLinks,
  ValidationErrors,
} from "@/domain/business-types"
import {
  validateBusinessIdentity,
  validateProfileDetails,
} from "@/domain/business-validation"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

const identityFields: {
  name: keyof BusinessIdentityInput
  label: string
}[] = [{ name: "businessName", label: "Registered business name" }]

const premisesFields: {
  name: keyof Pick<
    BusinessProfileDetailsInput,
    "premisesName" | "businessType" | "registrationNumber" | "address" | "ward"
  >
  label: string
}[] = [
  { name: "premisesName", label: "Premises name" },
  { name: "businessType", label: "Business type" },
  { name: "registrationNumber", label: "Registration number (optional)" },
  { name: "address", label: "Address" },
  { name: "ward", label: "Ward" },
]

const linkFields: {
  name: keyof BusinessProfileLinks
  label: string
  placeholder: string
}[] = [
  {
    name: "website",
    label: "Website",
    placeholder: "https://example.com",
  },
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourbusiness",
  },
  {
    name: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourbusiness",
  },
  {
    name: "x",
    label: "X",
    placeholder: "https://x.com/yourbusiness",
  },
]

function detailsFromProfile(
  profile: BusinessProfile
): BusinessProfileDetailsInput {
  const premises = profile.premises
  return {
    businessName: profile.businessName,
    contactName: profile.contactName,
    premisesName: premises?.premisesName ?? "",
    businessType: premises?.businessType ?? "",
    registrationNumber: premises?.registrationNumber ?? "",
    address: premises?.address ?? "",
    ward: premises?.ward ?? "",
    website: profile.links?.website ?? "",
    instagram: profile.links?.instagram ?? "",
    facebook: profile.links?.facebook ?? "",
    x: profile.links?.x ?? "",
  }
}

export function BusinessProfileForm({
  profile,
  showPremisesDetails = true,
}: {
  profile: BusinessProfile
  showPremisesDetails?: boolean
}) {
  const id = useId()
  const { refresh } = useBusinessSession()
  const [values, setValues] = useState(() => detailsFromProfile(profile))
  const [touched, setTouched] = useState<
    Partial<Record<keyof BusinessProfileDetailsInput, boolean>>
  >({})
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const hasPremises = Boolean(profile.premises && showPremisesDetails)
  const fields = hasPremises
    ? [...identityFields, ...premisesFields]
    : identityFields
  const editableFields = hasPremises ? [...fields, ...linkFields] : fields
  const original = detailsFromProfile(profile)
  const dirty = editableFields.some(
    ({ name }) => (values[name] ?? "").trim() !== (original[name] ?? "").trim()
  )
  const errors: ValidationErrors<BusinessProfileDetailsInput> = hasPremises
    ? validateProfileDetails(values)
    : validateBusinessIdentity(values)
  const valid = !Object.values(errors).some(Boolean)

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dirty || !valid || saving) return
    setSaving(true)
    setSaveError("")
    try {
      const repository = createBusinessRepository(createBusinessStorage())
      const result = hasPremises
        ? repository.updateProfileDetails(values)
        : repository.updateBusinessIdentity({
            businessName: values.businessName,
            contactName: values.contactName,
          })
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
      notifySuccess("Business profile saved")
    } catch {
      setSaveError("Unable to save changes. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="business-profile-fields">
      <h2 id="business-profile-fields" className="text-lg font-semibold">
        {hasPremises ? "Business and premises details" : "Business details"}
      </h2>
      <form
        onSubmit={(event) => void save(event)}
        className="mt-6 flex max-w-4xl flex-col gap-6"
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
        {hasPremises && (
          <div className="flex flex-col gap-5 pt-2">
            <h3 className="font-semibold">Public links</h3>
            <FieldGroup className="gap-5 sm:grid sm:grid-cols-2">
              {linkFields.map(({ name, label, placeholder }) => {
                const error = touched[name] ? errors[name] : undefined
                const fieldId = `${id}-${name}`
                return (
                  <Field key={name} data-invalid={!!error}>
                    <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
                    <Input
                      id={fieldId}
                      name={name}
                      type="url"
                      autoComplete="url"
                      placeholder={placeholder}
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
          </div>
        )}
        {saveError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap justify-end pt-2">
          <Button type="submit" disabled={!dirty || !valid || saving}>
            {saving ? "Saving changes…" : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  )
}
