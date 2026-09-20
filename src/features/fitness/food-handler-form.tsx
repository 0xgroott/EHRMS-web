import { useId, useState } from "react"
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
          <FieldLabel htmlFor={`${formId}-full-name`}>Full name</FieldLabel>
          <Input
            id={`${formId}-full-name`}
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            aria-invalid={fullName.invalid}
            aria-describedby={fullName.describedBy}
            className="min-h-11"
          />
          {fullName.error && (
            <FieldError id={fullName.describedBy}>{fullName.error}</FieldError>
          )}
        </Field>
        <div className="grid min-w-0 grid-cols-2 gap-4">
          <Field className="min-w-0">
            <FieldLabel htmlFor={`${formId}-sex`}>Sex</FieldLabel>
            <Select
              value={values.sex}
              onValueChange={(value) => update("sex", value ?? "")}
            >
              <SelectTrigger
                id={`${formId}-sex`}
                className="min-h-11 w-full min-w-0"
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
          </Field>
          <Field className="min-w-0">
            <FieldLabel htmlFor={`${formId}-date-of-birth`}>
              Date of birth
            </FieldLabel>
            <Input
              id={`${formId}-date-of-birth`}
              type="date"
              value={values.dateOfBirth}
              onChange={(event) => update("dateOfBirth", event.target.value)}
              className="min-h-11 w-full min-w-0"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor={`${formId}-role`}>Job role</FieldLabel>
          <Input
            id={`${formId}-role`}
            value={values.role}
            onChange={(event) => update("role", event.target.value)}
            className="min-h-11"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${formId}-identity-number`}>
            Identity number
          </FieldLabel>
          <Input
            id={`${formId}-identity-number`}
            value={values.identityNumber}
            onChange={(event) => update("identityNumber", event.target.value)}
            className="min-h-11"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${formId}-phone`}>Phone number</FieldLabel>
          <Input
            id={`${formId}-phone`}
            inputMode="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="min-h-11"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${formId}-branch`}>
            Business branch/location
          </FieldLabel>
          <Select
            items={branchOptions}
            value={values.premisesName}
            onValueChange={(value) => update("premisesName", value ?? "")}
            disabled={branchOptions.length < 2}
          >
            <SelectTrigger
              id={`${formId}-branch`}
              className="min-h-11 w-full min-w-0"
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
        </Field>
      </FieldGroup>

      <Field orientation="horizontal" className="min-w-0">
        <Checkbox
          id={`${formId}-consent`}
          checked={values.consent}
          onCheckedChange={(checked) => update("consent", checked)}
          aria-label="I confirm this food handler consents to use these details for the Fitness Certificate process."
        />
        <FieldContent className="min-w-0">
          <FieldLabel
            htmlFor={`${formId}-consent`}
            className="min-h-11 max-w-full items-start"
          >
            I confirm this food handler consents to use these details for the
            Fitness Certificate process.
          </FieldLabel>
        </FieldContent>
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-h-11 w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" className="min-h-11 w-full sm:w-auto">
          {handler ? "Save changes" : "Save food handler"}
        </Button>
      </div>
    </form>
  )
}
