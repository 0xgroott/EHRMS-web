import { useForm } from "@tanstack/react-form"
import { useId, useState } from "react"
import type { ReactNode } from "react"
import { DEMO_BUSINESS_CREDENTIALS } from "@/data/business-seeds"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SignInInput = { contact: string; password: string }
type SignInFormProps = {
  onSubmit: (
    input: SignInInput
  ) => void | { error?: string } | Promise<void | { error?: string }>
  createAccountLink: ReactNode
}

export function SignInForm({ onSubmit, createAccountLink }: SignInFormProps) {
  const id = useId()
  const [error, setError] = useState<string>()
  const form = useForm({
    defaultValues: { contact: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(undefined)
      try {
        const result = await onSubmit(value)
        setError(result?.error)
      } catch {
        setError("Unable to sign in. Please try again.")
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
      <FieldGroup>
        <form.Field
          name="contact"
          validators={{
            onSubmit: ({ value }) =>
              value.trim() ? undefined : "Enter your email or phone number",
          }}
        >
          {(field) => {
            const message = field.state.meta.errors[0]
            return (
              <Field data-invalid={!!message}>
                <FieldLabel htmlFor={`${id}-contact`}>
                  Email or phone number
                </FieldLabel>
                <Input
                  id={`${id}-contact`}
                  name={field.name}
                  autoComplete="username"
                  required
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={!!message}
                  aria-describedby={message ? `${id}-contact-error` : undefined}
                  className="min-h-11"
                />
                {message && (
                  <FieldError id={`${id}-contact-error`}>{message}</FieldError>
                )}
              </Field>
            )
          }}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onSubmit: ({ value }) =>
              value ? undefined : "Enter your password",
          }}
        >
          {(field) => {
            const message = field.state.meta.errors[0]
            return (
              <Field data-invalid={!!message}>
                <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
                <Input
                  id={`${id}-password`}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={!!message}
                  aria-describedby={
                    message ? `${id}-password-error` : undefined
                  }
                  className="min-h-11"
                />
                {message && (
                  <FieldError id={`${id}-password-error`}>{message}</FieldError>
                )}
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
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="min-h-11 w-full"
              onClick={() => {
                form.setFieldValue("contact", DEMO_BUSINESS_CREDENTIALS.email)
                form.setFieldValue(
                  "password",
                  DEMO_BUSINESS_CREDENTIALS.password
                )
                void form.handleSubmit()
              }}
            >
              Sign in as Riverside Kitchen
            </Button>
          </div>
        )}
      </form.Subscribe>
      <p className="text-center text-sm text-muted-foreground">
        New to the business portal? {createAccountLink}
      </p>
    </form>
  )
}
