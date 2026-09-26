import { useId, useState } from "react"
import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FoodHandler, FoodHandlerInput } from "./fitness-types"

type FormHandler = FoodHandlerInput & { id?: string }
type FormValues = FoodHandlerInput
export type BusinessBranchOption = { value: string; label: string }

function RequiredFieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <FieldLabel
      htmlFor={htmlFor}
      className="after:ml-0.5 after:text-destructive after:content-['*']"
    >
      {children}
    </FieldLabel>
  )
}

const emptyValues = (branch: string): FormValues => ({
  fullName: "",
  sex: "",
  dateOfBirth: "",
  role: "",
  identityNumber: "",
  phone: "",
  premisesName: branch,
  consent: false,
})

function valuesFrom(handler: FoodHandler | undefined, branch: string) {
  return handler ? { ...handler } : emptyValues(branch)
}

export function FoodHandlerForm({
  handler,
  branchOptions,
  onSave,
  onCancel,
}: {
  handler?: FoodHandler
  branchOptions: readonly BusinessBranchOption[]
  onSave: (handler: FormHandler) => void
  onCancel: () => void
}) {
  const formId = useId()
  const [values, setValues] = useState(() =>
    valuesFrom(handler, branchOptions[0]?.value ?? "")
  )
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({})
  const canSave = Boolean(
    values.fullName.trim() &&
    values.sex &&
    values.role.trim() &&
    values.identityNumber.trim() &&
    values.phone.trim() &&
    branchOptions.some((branch) => branch.value === values.premisesName) &&
    values.consent
  )

  const update = <TKey extends keyof FormValues>(
    field: TKey,
    value: FormValues[TKey]
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = () => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {}
    if (!values.fullName.trim())
      nextErrors.fullName = "Enter the handler's full name."
    if (!values.sex) nextErrors.sex = "Select the handler's sex."
    if (!values.role.trim()) nextErrors.role = "Enter the handler's job role."
    if (!values.identityNumber.trim())
      nextErrors.identityNumber = "Enter the handler's identity number."
    if (!values.phone.trim())
      nextErrors.phone = "Enter the handler's phone number."
    if (!values.premisesName.trim())
      nextErrors.premisesName = "Select a business branch/location."
    if (!values.consent) nextErrors.consent = "Confirm the handler's consent."
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSave(handler ? { ...values, id: handler.id } : values)
  }

  const field = (name: keyof FormValues) => {
    const error = errors[name]
    return {
      invalid: Boolean(error),
      describedBy: error ? `${formId}-${name}-error` : undefined,
      error,
    }
  }

  const fullName = field("fullName")
  const sex = field("sex")
  const dateOfBirth = field("dateOfBirth")
  const role = field("role")
  const identityNumber = field("identityNumber")
  const phone = field("phone")
  const premisesName = field("premisesName")
  const consent = field("consent")

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-7"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <FieldGroup className="min-w-0 gap-5">
        <Field data-invalid={fullName.invalid}>
          <RequiredFieldLabel htmlFor={`${formId}-full-name`}>
            Full name
          </RequiredFieldLabel>
          <Input
            id={`${formId}-full-name`}
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            aria-invalid={fullName.invalid}
            aria-describedby={fullName.describedBy}
            required
            className="min-h-11"
          />
          {fullName.error && (
            <FieldError id={fullName.describedBy}>{fullName.error}</FieldError>
          )}
        </Field>
        <div className="grid min-w-0 grid-cols-2 gap-4">
          <Field className="min-w-0" data-invalid={sex.invalid}>
            <RequiredFieldLabel htmlFor={`${formId}-sex`}>
              Sex
            </RequiredFieldLabel>
            <Select
              value={values.sex}
              onValueChange={(value) => update("sex", value ?? "")}
            >
              <SelectTrigger
                id={`${formId}-sex`}
                className="min-h-11 w-full min-w-0"
                aria-invalid={sex.invalid}
                aria-describedby={sex.describedBy}
                aria-required="true"
              >
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sex</SelectLabel>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {sex.error && (
              <FieldError id={sex.describedBy}>{sex.error}</FieldError>
            )}
          </Field>
          <Field className="min-w-0" data-invalid={dateOfBirth.invalid}>
            <FieldLabel htmlFor={`${formId}-date-of-birth`}>
              Date of birth
            </FieldLabel>
            <Input
              id={`${formId}-date-of-birth`}
              type="date"
              value={values.dateOfBirth}
              onChange={(event) => update("dateOfBirth", event.target.value)}
              className="min-h-11 w-full min-w-0"
              aria-invalid={dateOfBirth.invalid}
              aria-describedby={dateOfBirth.describedBy}
            />
            {dateOfBirth.error && (
              <FieldError id={dateOfBirth.describedBy}>
                {dateOfBirth.error}
              </FieldError>
            )}
          </Field>
        </div>
        <Field data-invalid={role.invalid}>
          <RequiredFieldLabel htmlFor={`${formId}-role`}>
            Job role
          </RequiredFieldLabel>
          <Input
            id={`${formId}-role`}
            value={values.role}
            onChange={(event) => update("role", event.target.value)}
            className="min-h-11"
            aria-invalid={role.invalid}
            aria-describedby={role.describedBy}
            required
          />
          {role.error && (
            <FieldError id={role.describedBy}>{role.error}</FieldError>
          )}
        </Field>
        <Field data-invalid={identityNumber.invalid}>
          <RequiredFieldLabel htmlFor={`${formId}-identity-number`}>
            Identity number
          </RequiredFieldLabel>
          <Input
            id={`${formId}-identity-number`}
            value={values.identityNumber}
            onChange={(event) => update("identityNumber", event.target.value)}
            className="min-h-11"
            aria-invalid={identityNumber.invalid}
            aria-describedby={identityNumber.describedBy}
            required
          />
          {identityNumber.error && (
            <FieldError id={identityNumber.describedBy}>
              {identityNumber.error}
            </FieldError>
          )}
        </Field>
        <Field data-invalid={phone.invalid}>
          <RequiredFieldLabel htmlFor={`${formId}-phone`}>
            Phone number
          </RequiredFieldLabel>
          <Input
            id={`${formId}-phone`}
            inputMode="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="min-h-11"
            aria-invalid={phone.invalid}
            aria-describedby={phone.describedBy}
            required
          />
          {phone.error && (
            <FieldError id={phone.describedBy}>{phone.error}</FieldError>
          )}
        </Field>
        <Field data-invalid={premisesName.invalid}>
          <RequiredFieldLabel htmlFor={`${formId}-branch`}>
            Business branch/location
          </RequiredFieldLabel>
          <Select
            items={branchOptions}
            value={values.premisesName}
            onValueChange={(value) => update("premisesName", value ?? "")}
            disabled={branchOptions.length < 2}
          >
            <SelectTrigger
              id={`${formId}-branch`}
              className="min-h-11 w-full min-w-0"
              aria-invalid={premisesName.invalid}
              aria-describedby={premisesName.describedBy}
              aria-required="true"
            >
              <SelectValue placeholder="Select branch/location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {premisesName.error && (
            <FieldError id={premisesName.describedBy}>
              {premisesName.error}
            </FieldError>
          )}
        </Field>
      </FieldGroup>

      <Alert className="border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Consent confirmation</AlertTitle>
        <AlertDescription>
          <Field
            orientation="horizontal"
            className="mt-2 min-w-0"
            data-invalid={consent.invalid}
          >
            <Checkbox
              id={`${formId}-consent`}
              checked={values.consent}
              onCheckedChange={(checked) => update("consent", checked)}
              aria-label="I confirm this staff member consents to use these details for the Fitness Certificate process."
              aria-invalid={consent.invalid}
              aria-describedby={consent.describedBy}
              aria-required="true"
            />
            <FieldContent className="min-w-0">
              <FieldLabel
                htmlFor={`${formId}-consent`}
                className="min-h-11 max-w-full items-start font-normal text-current"
              >
                I confirm this staff member consents to use these details for
                the Fitness Certificate process.
              </FieldLabel>
              {consent.error && (
                <FieldError id={consent.describedBy}>
                  {consent.error}
                </FieldError>
              )}
            </FieldContent>
          </Field>
        </AlertDescription>
      </Alert>

      {!canSave && (
        <p className="text-sm text-muted-foreground">
          Complete the required fields and confirm consent to save.
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-h-11 w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSave}
          className="min-h-11 w-full sm:w-auto"
        >
          {handler ? "Save changes" : "Save staff member"}
        </Button>
      </div>
    </form>
  )
}
