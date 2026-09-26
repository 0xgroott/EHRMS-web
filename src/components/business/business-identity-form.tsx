import { useForm } from "@tanstack/react-form"
import { useId, useState } from "react"
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
  BusinessIdentityInput,
  ValidationErrors,
} from "@/domain/business-types"
import { validateBusinessIdentity } from "@/domain/business-validation"

type IdentityActionResult = void | {
  error?: string
  fieldErrors?: ValidationErrors<BusinessIdentityInput>
}

export function BusinessIdentityForm({
  onSubmit,
}: {
  onSubmit: (
    input: BusinessIdentityInput
  ) => IdentityActionResult | Promise<IdentityActionResult>
}) {
  const id = useId()
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<
    ValidationErrors<BusinessIdentityInput>
  >({})
  const form = useForm({
    defaultValues: { businessName: "", contactName: "" },
    validators: {
      onSubmit: ({ value }) => {
        const errors = validateBusinessIdentity(value)
        return Object.keys(errors).length ? { fields: errors } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setError(undefined)
      setFieldErrors({})
      try {
        const result = await onSubmit(value)
        setError(result?.error)
        setFieldErrors(result?.fieldErrors ?? {})
      } catch {
        setError("Unable to save your details. Please try again.")
      }
    },
  })

  const fields = [
    {
      name: "businessName",
      label: "Business name",
      autoComplete: "organization",
    },
    {
      name: "contactName",
      label: "Your full name",
      autoComplete: "name",
    },
  ] as const

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup className="gap-5">
        {fields.map(({ name, label, autoComplete }) => (
          <form.Field key={name} name={name}>
            {(field) => {
              const message = fieldErrors[name] ?? field.state.meta.errors[0]
              const inputId = `${id}-${name}`
              return (
                <Field data-invalid={!!message}>
                  <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
                  <Input
                    id={inputId}
                    name={name}
                    autoComplete={autoComplete}
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value)
                      setFieldErrors((current) => ({
                        ...current,
                        [name]: undefined,
                      }))
                      setError(undefined)
                    }}
                    aria-invalid={!!message}
                    aria-describedby={message ? `${inputId}-error` : undefined}
                    className="min-h-11"
                  />
                  {message && (
                    <FieldError id={`${inputId}-error`}>{message}</FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
        ))}
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 w-full"
          >
            {isSubmitting ? "Saving details…" : "Continue"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
