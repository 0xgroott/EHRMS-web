import { useForm } from "@tanstack/react-form"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"
import { seedDatabase } from "@/data/seeds"
import type {
  BusinessDocument,
  BusinessPremisesInput,
} from "@/domain/business-types"
import { validatePremises } from "@/domain/business-validation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AutosaveStatus } from "./autosave-status"
import type { AutosaveState } from "./autosave-status"
import { Button } from "@/components/ui/button"
import {
  Field,
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

export type SetupActionResult = void | { error?: string }
export type SetupAction = (
  premises: BusinessPremisesInput,
  documents: BusinessDocument[]
) => SetupActionResult | Promise<SetupActionResult>

type BusinessSetupFormProps = {
  initialValues: BusinessPremisesInput
  initialDocuments: BusinessDocument[]
  contactEmail: string
  contactPhone: string
  onSaveDraft: SetupAction
  onComplete: SetupAction
  onExit: () => void
  heading?: ReactNode
}

const acceptedDocumentTypes = ["application/pdf", "image/jpeg", "image/png"]

const acceptedDocumentExtensions = ".pdf,.jpg,.jpeg,.png"

function createDocumentId() {
  return globalThis.crypto.randomUUID()
}

function errorMessage(result: SetupActionResult) {
  return result && "error" in result ? result.error : undefined
}

function AutosaveObserver({
  values,
  documents,
  onChange,
}: {
  values: BusinessPremisesInput
  documents: BusinessDocument[]
  onChange: (
    values: BusinessPremisesInput,
    documents: BusinessDocument[]
  ) => void
}) {
  const signature = JSON.stringify({ values, documents })
  const firstRender = useRef(true)
  const latest = useRef({ values, documents, onChange })
  latest.current = { values, documents, onChange }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    latest.current.onChange(latest.current.values, latest.current.documents)
  }, [signature])

  return null
}

export function BusinessSetupForm({
  initialValues,
  initialDocuments,
  contactEmail,
  contactPhone,
  onSaveDraft,
  onComplete,
  onExit,
  heading,
}: BusinessSetupFormProps) {
  const id = useId()
  const [documents, setDocuments] = useState<BusinessDocument[]>(() => [
    ...initialDocuments,
  ])
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("idle")
  const [actionError, setActionError] = useState<string>()
  const [isExiting, setIsExiting] = useState(false)
  const latestDraft = useRef({ values: initialValues, documents })
  const autosaveTimer = useRef<number | undefined>(undefined)
  const autosaveRevision = useRef(0)
  const activeSave = useRef<Promise<boolean> | null>(null)
  const completionPending = useRef(false)
  const completionFinished = useRef(false)

  const form = useForm({
    defaultValues: {
      ...initialValues,
      registrationNumber: initialValues.registrationNumber ?? "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors = validatePremises(value)
        return Object.keys(errors).length ? { fields: errors } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      if (completionPending.current || completionFinished.current) return
      completionPending.current = true
      if (autosaveTimer.current !== undefined) {
        window.clearTimeout(autosaveTimer.current)
        autosaveTimer.current = undefined
      }
      setActionError(undefined)
      setIsExiting(true)
      try {
        await activeSave.current
        const result = await onComplete(value, latestDraft.current.documents)
        const error = errorMessage(result)
        if (error) {
          setActionError(error)
        } else {
          completionFinished.current = true
        }
      } catch {
        setActionError("Unable to complete setup. Please try again.")
      } finally {
        if (!completionFinished.current) completionPending.current = false
        setIsExiting(false)
      }
    },
  })

  const saveDraft = useCallback(
    async (
      values: BusinessPremisesInput,
      nextDocuments: BusinessDocument[],
      revision: number,
      allowDuringCompletion = false
    ) => {
      const previous = activeSave.current
      if (previous) await previous
      if (completionPending.current && !allowDuringCompletion) return false
      if (revision !== autosaveRevision.current && !allowDuringCompletion) {
        return false
      }

      setAutosaveState("saving")
      try {
        const result = await onSaveDraft(values, nextDocuments)
        if (
          !allowDuringCompletion &&
          (completionPending.current || revision !== autosaveRevision.current)
        ) {
          return false
        }
        const error = errorMessage(result)
        if (error) {
          setAutosaveState("error")
          setActionError(error)
          return false
        }
        setActionError(undefined)
        setAutosaveState("saved")
        return true
      } catch {
        if (
          !allowDuringCompletion &&
          (completionPending.current || revision !== autosaveRevision.current)
        ) {
          return false
        }
        setAutosaveState("error")
        setActionError("Couldn't save your draft.")
        return false
      }
    },
    [onSaveDraft]
  )

  const scheduleAutosave = useCallback(
    (values: BusinessPremisesInput, nextDocuments: BusinessDocument[]) => {
      if (completionPending.current || completionFinished.current) return
      latestDraft.current = { values, documents: nextDocuments }
      const revision = ++autosaveRevision.current
      if (autosaveTimer.current !== undefined) {
        window.clearTimeout(autosaveTimer.current)
      }
      setAutosaveState("saving")
      autosaveTimer.current = window.setTimeout(() => {
        autosaveTimer.current = undefined
        const operation = saveDraft(values, nextDocuments, revision)
        activeSave.current = operation
        void operation.finally(() => {
          if (activeSave.current === operation) activeSave.current = null
        })
      }, 500)
    },
    [saveDraft]
  )

  useEffect(
    () => () => {
      if (autosaveTimer.current !== undefined) {
        window.clearTimeout(autosaveTimer.current)
      }
      autosaveRevision.current += 1
    },
    []
  )

  async function handleSaveAndExit() {
    if (completionPending.current || completionFinished.current) return
    completionPending.current = true
    if (autosaveTimer.current !== undefined) {
      window.clearTimeout(autosaveTimer.current)
      autosaveTimer.current = undefined
    }
    setIsExiting(true)
    try {
      const revision = autosaveRevision.current
      const operation = saveDraft(
        latestDraft.current.values,
        latestDraft.current.documents,
        revision,
        true
      )
      activeSave.current = operation
      void operation.finally(() => {
        if (activeSave.current === operation) activeSave.current = null
      })
      const saved = await operation
      if (saved) {
        completionFinished.current = true
        onExit()
      }
    } finally {
      if (!completionFinished.current) completionPending.current = false
      setIsExiting(false)
    }
  }

  async function handleRetry() {
    if (completionPending.current || completionFinished.current) return
    const operation = saveDraft(
      latestDraft.current.values,
      latestDraft.current.documents,
      autosaveRevision.current
    )
    activeSave.current = operation
    void operation.finally(() => {
      if (activeSave.current === operation) activeSave.current = null
    })
    await operation
  }

  function handleDocuments(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    const unsupported = selected.find(
      (file) => !acceptedDocumentTypes.includes(file.type)
    )
    if (unsupported) {
      setActionError("Upload a PDF, JPG, or PNG file")
      event.target.value = ""
      return
    }

    setActionError(undefined)
    setDocuments((current) => [
      ...current,
      ...selected.map((file) => ({
        id: createDocumentId(),
        name: file.name,
        size: file.size,
        category: "Supporting document",
      })),
    ])
    event.target.value = ""
  }

  function fieldError(
    field: { state: { meta: { errors: unknown[] } } },
    fallback?: string
  ) {
    const error = field.state.meta.errors[0]
    return typeof error === "string" ? error : fallback
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-8"
    >
      {heading}
      <form.Subscribe selector={(state) => state.values}>
        {(values) => (
          <AutosaveObserver
            values={values}
            documents={documents}
            onChange={scheduleAutosave}
          />
        )}
      </form.Subscribe>

      <AutosaveStatus
        state={autosaveState}
        onRetry={() => void handleRetry()}
      />
      {actionError && autosaveState !== "error" && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <FieldSet>
        <FieldLegend>Business details</FieldLegend>
        <FieldGroup>
          <form.Field name="premisesName">
            {(field) => {
              const error = fieldError(field)
              return (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor={`${id}-premises-name`}>
                    Premises name
                  </FieldLabel>
                  <Input
                    id={`${id}-premises-name`}
                    name={field.name}
                    required
                    disabled={isExiting}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={
                      error ? `${id}-premises-name-error` : undefined
                    }
                    className="min-h-11"
                  />
                  {error && (
                    <FieldError id={`${id}-premises-name-error`}>
                      {error}
                    </FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="businessType">
            {(field) => {
              const error = fieldError(field)
              return (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor={`${id}-business-type`}>
                    Business type
                  </FieldLabel>
                  <Input
                    id={`${id}-business-type`}
                    name={field.name}
                    required
                    disabled={isExiting}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={
                      error ? `${id}-business-type-error` : undefined
                    }
                    className="min-h-11"
                  />
                  {error && (
                    <FieldError id={`${id}-business-type-error`}>
                      {error}
                    </FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Registration details</FieldLegend>
        <FieldGroup>
          <form.Field name="registrationNumber">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={`${id}-registration-number`}>
                  Registration number{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id={`${id}-registration-number`}
                  name={field.name}
                  disabled={isExiting}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  className="min-h-11"
                />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Premises and address</FieldLegend>
        <FieldGroup>
          <form.Field name="address">
            {(field) => {
              const error = fieldError(field)
              return (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor={`${id}-address`}>
                    Premises address
                  </FieldLabel>
                  <Input
                    id={`${id}-address`}
                    name={field.name}
                    required
                    disabled={isExiting}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-address-error` : undefined}
                    className="min-h-11"
                  />
                  {error && (
                    <FieldError id={`${id}-address-error`}>{error}</FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="ward">
            {(field) => {
              const error = fieldError(field)
              return (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor={`${id}-ward`}>Ward</FieldLabel>
                  <Input
                    id={`${id}-ward`}
                    name={field.name}
                    required
                    disabled={isExiting}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-ward-error` : undefined}
                    className="min-h-11"
                  />
                  {error && (
                    <FieldError id={`${id}-ward-error`}>{error}</FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Council and contact details</FieldLegend>
        <FieldGroup>
          <form.Field name="councilId">
            {(field) => {
              const error = fieldError(field)
              return (
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor={`${id}-council`}>Council</FieldLabel>
                  <Select
                    disabled={isExiting}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value ?? "")}
                  >
                    <SelectTrigger
                      id={`${id}-council`}
                      name={field.name}
                      disabled={isExiting}
                      aria-invalid={!!error}
                      aria-describedby={
                        error ? `${id}-council-error` : undefined
                      }
                      className="min-h-11 w-full"
                    >
                      <SelectValue placeholder="Choose a council" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Councils</SelectLabel>
                        {seedDatabase.councils.map((council) => (
                          <SelectItem key={council.id} value={council.id}>
                            {council.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {error && (
                    <FieldError id={`${id}-council-error`}>{error}</FieldError>
                  )}
                </Field>
              )
            }}
          </form.Field>
          <div
            aria-label="Account contact details"
            className="flex flex-col gap-2 rounded-md border bg-muted/30 p-4 text-sm"
          >
            <p className="font-medium">Account contact details</p>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{contactEmail}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{contactPhone}</dd>
              </div>
            </dl>
            <p className="text-muted-foreground">
              These details come from your verified account contact.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor={`${id}-supporting-document`}>
              Supporting document{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id={`${id}-supporting-document`}
              type="file"
              disabled={isExiting}
              accept={acceptedDocumentExtensions}
              multiple
              onChange={handleDocuments}
              className="min-h-11 cursor-pointer"
            />
            <FieldDescription>
              PDF, JPG, or PNG. Document names and file details are saved in
              this browser; file contents are not uploaded.
            </FieldDescription>
            {documents.length > 0 && (
              <ul
                className="flex flex-col gap-2 text-sm"
                aria-label="Selected documents"
              >
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <span className="truncate">{document.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {document.size} bytes
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={isExiting}
          className="min-h-11"
          onClick={() => void handleSaveAndExit()}
        >
          {isExiting ? "Saving draft…" : "Save draft and exit"}
        </Button>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              disabled={isSubmitting || isExiting}
              className="min-h-11"
            >
              {isSubmitting ? "Completing setup…" : "Save and continue"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
