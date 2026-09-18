import { useForm } from "@tanstack/react-form"
import { useId, useState } from "react"
import type { ReactNode } from "react"
import type { BusinessAccountInput } from "@/domain/business-types"
import { validateAccount } from "@/domain/business-validation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type AccountFormProps = {
  onSubmit: (
    input: BusinessAccountInput
  ) => void | { error?: string } | Promise<void | { error?: string }>
  signInLink: ReactNode
}

const defaultValues: BusinessAccountInput = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  password: "",
  acceptedTerms: false,
}

const fields = [
  {
    name: "businessName",
    label: "Business name",
    type: "text",
    autoComplete: "organization",
  },
  {
    name: "contactName",
    label: "Contact person's name",
    type: "text",
    autoComplete: "name",
  },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  {
    name: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
  },
] as const

export function AccountForm({ onSubmit, signInLink }: AccountFormProps) {
  const id = useId()
  const [error, setError] = useState<string>()
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const errors = validateAccount(value)
        return Object.keys(errors).length ? { fields: errors } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      setError(undefined)
      try {
        const result = await onSubmit(value)
        setError(result?.error)
      } catch {
        setError("Unable to create your account. Please try again.")
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-6"
    >
      <FieldGroup className="gap-5">
        {fields.map(({ name, label, type, autoComplete }) => (
          <form.Field key={name} name={name}>
            {(field) => {
              const message = field.state.meta.errors[0]
              const inputId = `${id}-${name}`
              const description =
                [
                  name === "password" ? `${inputId}-hint` : "",
                  message ? `${inputId}-error` : "",
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              return (
                <Field data-invalid={!!message}>
                  <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
                  <Input
                    id={inputId}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    required
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!message}
                    aria-describedby={description}
                    className="min-h-11"
                  />
                  {name === "password" && (
                    <FieldDescription id={`${inputId}-hint`}>
                      Use at least 10 characters.
                    </FieldDescription>
                  )}
                  {message && (
                    <FieldError id={`${inputId}-error`}>{message}</FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
        ))}
        <form.Field name="acceptedTerms">
          {(field) => {
            const message = field.state.meta.errors[0]
            return (
              <Field orientation="horizontal" data-invalid={!!message}>
                <Checkbox
                  id={`${id}-consent`}
                  name={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                  onBlur={field.handleBlur}
                  required
                  aria-invalid={!!message}
                  aria-describedby={message ? `${id}-consent-error` : undefined}
                />
                <FieldContent>
                  <FieldLabel
                    htmlFor={`${id}-consent`}
                    className="min-h-11 items-start"
                  >
                    I accept the terms and privacy notice.
                  </FieldLabel>
                  {message && (
                    <FieldError id={`${id}-consent-error`}>
                      {message}
                    </FieldError>
                  )}
                </FieldContent>
              </Field>
            )
          }}
        </form.Field>
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
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        )}
      </form.Subscribe>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? {signInLink}
      </p>
    </form>
  )
}
