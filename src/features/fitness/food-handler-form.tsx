import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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

type SaveDestination = "list" | "another"
type FormHandler = FoodHandlerInput & { id?: string }

type FormValues = FoodHandlerInput

const emptyValues = (premisesName: string): FormValues => ({
  fullName: "",
  sex: "",
  dateOfBirth: "",
  role: "",
  identityNumber: "",
  phone: "",
  premisesName,
  consent: false,
})

function valuesFrom(handler: FoodHandler | undefined, premisesName: string) {
  return handler ? { ...handler } : emptyValues(premisesName)
}

export function FoodHandlerForm({
  handler,
  premisesName,
  onSave,
  onCancel,
}: {
  handler?: FoodHandler
  premisesName: string
  onSave: (handler: FormHandler, destination: SaveDestination) => void
  onCancel: () => void
}) {
  const formId = useId()
  const [values, setValues] = useState(() => valuesFrom(handler, premisesName))
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

  const submit = (destination: SaveDestination) => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {}
    if (!values.fullName.trim())
      nextErrors.fullName = "Enter the handler's full name."
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    onSave(handler ? { ...values, id: handler.id } : values, destination)
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
      className="flex max-w-3xl flex-col gap-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit("list")
      }}
    >
      <FieldSet>
        <FieldLegend>Food handler details</FieldLegend>
        <FieldDescription>
          These details are used to prepare a Fitness Certificate application.
        </FieldDescription>
        <FieldGroup className="grid gap-6 md:grid-cols-2">
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
              <FieldError id={fullName.describedBy}>
                {fullName.error}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-sex`}>Sex</FieldLabel>
            <Select
              value={values.sex}
              onValueChange={(value) => update("sex", value ?? "")}
            >
              <SelectTrigger id={`${formId}-sex`} className="min-h-11 w-full">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sex</SelectLabel>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-date-of-birth`}>
              Date of birth
            </FieldLabel>
            <Input
              id={`${formId}-date-of-birth`}
              type="date"
              value={values.dateOfBirth}
              onChange={(event) => update("dateOfBirth", event.target.value)}
              className="min-h-11"
            />
          </Field>
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
          <Field className="md:col-span-2">
            <FieldLabel htmlFor={`${formId}-workplace`}>Workplace</FieldLabel>
            <Input
              id={`${formId}-workplace`}
              value={values.premisesName}
              readOnly
              className="min-h-11"
            />
            <FieldDescription>
              This record is linked to the premises in your business profile.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Field orientation="horizontal">
        <Checkbox
          id={`${formId}-consent`}
          checked={values.consent}
          onCheckedChange={(checked) => update("consent", checked)}
          aria-label="I confirm this food handler consents to use these details for the Fitness Certificate process."
        />
        <FieldContent>
          <FieldLabel
            htmlFor={`${formId}-consent`}
            className="min-h-11 items-start"
          >
            I confirm this food handler consents to use these details for the
            Fitness Certificate process.
          </FieldLabel>
        </FieldContent>
      </Field>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center">
        <Button type="submit">
          {handler ? "Save changes" : "Save food handler"}
        </Button>
        {!handler && (
          <Button
            type="button"
            variant="outline"
            onClick={() => submit("another")}
          >
            Save and add another
          </Button>
        )}
        <Button
          type="button"
          variant="link"
          onClick={onCancel}
          className="sm:ml-auto"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
