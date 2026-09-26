import { useForm } from "@tanstack/react-form"
import { useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"
import type {
  BusinessAccountInput,
  ValidationErrors,
} from "@/domain/business-types"
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

type AccountActionResult = void | {
  error?: string
  fieldErrors?: ValidationErrors<BusinessAccountInput>
}
type AccountFormProps = {
  onSubmit: (
    input: BusinessAccountInput
  ) => AccountActionResult | Promise<AccountActionResult>
  signInLink: ReactNode
  firstStepContent?: ReactNode
  onPageChange?: (page: 1 | 2) => void
}

const defaultValues: BusinessAccountInput = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  password: "",
  acceptedTerms: false,
}

const businessFields = [
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
] as const

const accessFields = [
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

export function AccountForm({
  onSubmit,
  signInLink,
  firstStepContent,
  onPageChange,
}: AccountFormProps) {
  const id = useId()
  const [page, setPage] = useState<1 | 2>(1)
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<
    ValidationErrors<BusinessAccountInput>
  >({})
  const pageHeading = useRef<HTMLHeadingElement>(null)
  const focusPageHeading = useRef(false)
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
      setFieldErrors({})
      try {
        const result = await onSubmit(value)
        setError(result?.error)
        setFieldErrors(result?.fieldErrors ?? {})
        if (
          result?.fieldErrors?.businessName ||
          result?.fieldErrors?.contactName
        ) {
          focusPageHeading.current = true
          setPage(1)
          onPageChange?.(1)
        }
      } catch {
        setError("Unable to create your account. Please try again.")
      }
    },
  })

  useEffect(() => {
    if (!focusPageHeading.current) return
    pageHeading.current?.focus()
    focusPageHeading.current = false
  }, [page])

  function showPage(nextPage: 1 | 2) {
    focusPageHeading.current = true
    setError(undefined)
    setPage(nextPage)
    onPageChange?.(nextPage)
  }

  function continueToAccountAccess() {
    const errors = validateAccount(form.state.values)
    const visibleErrors: ValidationErrors<BusinessAccountInput> = {
      businessName: errors.businessName,
      contactName: errors.contactName,
    }
    setFieldErrors(visibleErrors)
    setError(undefined)
    if (visibleErrors.businessName || visibleErrors.contactName) return
    showPage(2)
  }

  const fields = page === 1 ? businessFields : accessFields

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (page === 1) {
          continueToAccountAccess()
          return
        }
        void form.handleSubmit()
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5">
        <h2
          ref={pageHeading}
          tabIndex={-1}
          className="text-lg font-semibold tracking-tight outline-none"
        >
          {page === 1 ? "Business details" : "Account access"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {page === 1
            ? "Tell us about the business and the person responsible for it."
            : "Add the contact details and password you will use to sign in."}
        </p>
      </div>
      {page === 1 && firstStepContent}
      <FieldGroup className="gap-5">
        {fields.map(({ name, label, type, autoComplete }) => (
          <form.Field key={name} name={name}>
            {(field) => {
              const message = fieldErrors[name] ?? field.state.meta.errors[0]
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
                    onChange={(event) => {
                      field.handleChange(event.target.value)
                      setFieldErrors((current) => ({
                        ...current,
                        [name]: undefined,
                      }))
                      setError(undefined)
                    }}
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
        {page === 2 && (
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
                    aria-describedby={
                      message ? `${id}-consent-error` : undefined
                    }
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
        )}
      </FieldGroup>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {page === 1 ? (
        <Button
          type="button"
          className="min-h-11 w-full"
          onClick={continueToAccountAccess}
        >
          Continue
        </Button>
      ) : (
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="min-h-11 px-5"
                onClick={() => showPage(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 w-full"
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? {signInLink}
      </p>
    </form>
  )
}
