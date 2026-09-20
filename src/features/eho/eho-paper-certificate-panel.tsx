import { useEffect, useState } from "react"
import { FileCheck2, Plus, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  readPaperCertificates,
  recordPaperCertificate,
  validatePaperCertificate,
} from "./eho-paper-certificate"
import type {
  PaperCertificateInput,
  PaperCertificateObservation,
} from "./eho-paper-certificate"

function localDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const emptyEntry = (): PaperCertificateInput => ({
  type: "Fitness",
  reference: "",
  seenAt: localDate(),
  expiresAt: "",
  note: "",
})

export function EhoPaperCertificatePanel({
  officerId,
  premisesId,
}: {
  officerId: string
  premisesId: string
}) {
  const [observations, setObservations] = useState<
    PaperCertificateObservation[]
  >([])
  const [open, setOpen] = useState(false)
  const [entry, setEntry] = useState<PaperCertificateInput>(emptyEntry)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    setObservations(readPaperCertificates(localStorage, officerId, premisesId))
  }, [officerId, premisesId])

  function update<TField extends keyof PaperCertificateInput>(
    field: TField,
    value: PaperCertificateInput[TField]
  ) {
    setEntry((current) => ({ ...current, [field]: value }))
    setError("")
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validatePaperCertificate(entry, localDate())
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      recordPaperCertificate(localStorage, officerId, premisesId, entry)
      setObservations(
        readPaperCertificates(localStorage, officerId, premisesId)
      )
      setEntry(emptyEntry())
      setOpen(false)
      setError("")
      setNotice("Paper certificate observation saved on this device.")
    } catch {
      setError("Could not save this observation. Try again.")
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck2 className="size-5 text-primary" aria-hidden="true" />
            Paper certificates seen
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Field observations do not change digital certificate status.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => {
            setOpen((current) => !current)
            setError("")
            setNotice("")
          }}
        >
          {open ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {open ? "Cancel" : "Record paper certificate seen"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {notice && (
          <Alert role="status">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        {open && (
          <form
            onSubmit={submit}
            noValidate
            className="grid gap-4 border-t pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="paper-type" className="text-sm font-medium">
                  Certificate type
                </label>
                <select
                  id="paper-type"
                  value={entry.type}
                  onChange={(event) =>
                    update(
                      "type",
                      event.target.value as PaperCertificateInput["type"]
                    )
                  }
                  className="min-h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option>Health Approval</option>
                  <option>Fumigation</option>
                  <option>Fitness</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="paper-reference"
                  className="text-sm font-medium"
                >
                  Certificate reference
                </label>
                <Input
                  id="paper-reference"
                  className="min-h-11"
                  value={entry.reference}
                  onChange={(event) => update("reference", event.target.value)}
                  maxLength={80}
                  aria-invalid={!!error && !entry.reference.trim()}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="paper-seen" className="text-sm font-medium">
                  Date seen
                </label>
                <Input
                  id="paper-seen"
                  type="date"
                  className="min-h-11"
                  max={localDate()}
                  value={entry.seenAt}
                  onChange={(event) => update("seenAt", event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="paper-expiry" className="text-sm font-medium">
                  Expiry date (if shown)
                </label>
                <Input
                  id="paper-expiry"
                  type="date"
                  className="min-h-11"
                  value={entry.expiresAt}
                  onChange={(event) => update("expiresAt", event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="paper-note" className="text-sm font-medium">
                Observation (optional)
              </label>
              <Textarea
                id="paper-note"
                value={entry.note}
                onChange={(event) => update("note", event.target.value)}
                maxLength={500}
                placeholder="Where and by whom the certificate was shown"
              />
            </div>
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="min-h-11 sm:justify-self-start">
              Save observation
            </Button>
          </form>
        )}
        {observations.length > 0 ? (
          <ul className="divide-y border-t">
            {observations.map((item) => (
              <li key={item.id} className="py-4 first:pt-4 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.type} · {item.reference}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Seen {item.seenAt}
                      {item.expiresAt
                        ? ` · Expiry shown ${item.expiresAt}`
                        : ""}
                    </p>
                    {item.note && <p className="mt-2 text-sm">{item.note}</p>}
                  </div>
                  <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                    Paper record
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !open && (
            <p className="text-sm text-muted-foreground">
              No paper certificates recorded for this premises.
            </p>
          )
        )}
      </CardContent>
    </Card>
  )
}
