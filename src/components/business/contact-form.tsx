import { useForm } from "@tanstack/react-form"
import { useId, useState } from "react"
import type { ContactInput } from "@/services/business-repository"
import type { ValidationErrors } from "@/domain/business-types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ContactResult = void | {
  error?: string
  fieldErrors?: ValidationErrors<ContactInput>
}

export function ContactForm({
  contact,
  onSubmit,
  onCancel,
}: {
  contact: ContactInput
  onSubmit: (contact: ContactInput) => ContactResult | Promise<ContactResult>
  onCancel: () => void
}) {
  const id = useId()
  const [error, setError] = useState<string>()
  const [errors, setErrors] = useState<ValidationErrors<ContactInput>>({})
  const form = useForm({
    defaultValues: contact,
    onSubmit: async ({ value }) => {
      setError(undefined)
      setErrors({})
      try {
        const result = await onSubmit(value)
        setError(result?.error)
        setErrors(result?.fieldErrors ?? {})
      } catch {
        setError("Unable to save your email address. Please try again.")
      }
    },
  })
  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        {(
          [{ name: "email", label: "Email address", type: "email" }] as const
        ).map(({ name, label, type }) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <Field data-invalid={!!errors[name]}>
                <FieldLabel htmlFor={`${id}-${name}`}>{label}</FieldLabel>
                <Input
                  id={`${id}-${name}`}
                  name={name}
                  type={type}
                  autoComplete={type}
                  required
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value)
                    setErrors((current) => ({ ...current, [name]: undefined }))
                    setError(undefined)
                  }}
                  onBlur={field.handleBlur}
                  aria-invalid={!!errors[name]}
                  aria-describedby={
                    errors[name] ? `${id}-${name}-error` : undefined
                  }
                  className="min-h-11"
                />
                {errors[name] && (
                  <FieldError id={`${id}-${name}-error`}>
                    {errors[name]}
                  </FieldError>
                )}
              </Field>
            )}
          </form.Field>
        ))}
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(pending) => (
          <>
            <Button type="submit" disabled={pending} className="min-h-11">
              {pending ? "Saving email…" : "Save email and continue"}
            </Button>
            <Button
              type="button"
              variant="link"
              disabled={pending}
              className="min-h-11"
              onClick={onCancel}
            >
              Back to verification
            </Button>
          </>
        )}
      </form.Subscribe>
    </form>
  )
}
