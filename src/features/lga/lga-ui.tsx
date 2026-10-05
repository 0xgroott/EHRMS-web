import { Download } from "lucide-react"
import { useId, useState } from "react"
import type { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/empty-state"
import type { LgaFilters } from "./lga-data"

export const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
export const daysSince = (date: string, end = new Date().toISOString()) =>
  Math.max(0, Math.floor((Date.parse(end) - Date.parse(date)) / 86_400_000))
export const premisesHref = (id: string) =>
  `/lga/premises/${encodeURIComponent(id)}`

export function LgaSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <Field className="w-full min-w-0 gap-2 sm:w-auto sm:min-w-40">
      <FieldLabel htmlFor={id} className="sr-only">
        {label}
      </FieldLabel>
      <Select
        value={value}
        items={options}
        onValueChange={(next) => onChange(next ?? "all")}
      >
        <SelectTrigger id={id} aria-label={label} className="min-h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function LgaFilterBar({
  wards,
  filters,
  onChange,
  dates = false,
  services = false,
  leading,
  children,
}: {
  wards: string[]
  filters: LgaFilters
  onChange: (filters: LgaFilters) => void
  dates?: boolean
  services?: boolean
  leading?: ReactNode
  children?: ReactNode
}) {
  return (
    <section aria-label="Filters" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        {leading}
        <LgaSelect
          label="Ward"
          value={filters.ward ?? "all"}
          options={[
            { value: "all", label: "All wards" },
            ...wards.map((ward) => ({ value: ward, label: ward })),
          ]}
          onChange={(ward) =>
            onChange({ ...filters, ward: ward === "all" ? undefined : ward })
          }
        />
        {services && (
          <LgaSelect
            label="Service"
            value={filters.service ?? "all"}
            options={[
              { value: "all", label: "All services" },
              ...["Fitness", "Fumigation"].map((service) => ({
                value: service,
                label: service,
              })),
            ]}
            onChange={(service) =>
              onChange({
                ...filters,
                service: service === "all" ? undefined : service,
              })
            }
          />
        )}
        {dates && (
          <>
            <Field className="w-full min-w-0 gap-2 sm:w-40">
              <FieldLabel htmlFor="lga-from">From</FieldLabel>
              <Input
                id="lga-from"
                type="date"
                className="min-h-11"
                value={filters.from ?? ""}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    from: event.target.value || undefined,
                  })
                }
              />
            </Field>
            <Field className="w-full min-w-0 gap-2 sm:w-40">
              <FieldLabel htmlFor="lga-to">To</FieldLabel>
              <Input
                id="lga-to"
                type="date"
                className="min-h-11"
                value={filters.to ?? ""}
                onChange={(event) =>
                  onChange({ ...filters, to: event.target.value || undefined })
                }
              />
            </Field>
          </>
        )}
        {children}
        {Object.values(filters).some(Boolean) && (
          <Button
            variant="ghost"
            className="min-h-11 self-start sm:self-end"
            onClick={() => onChange({})}
          >
            Clear filters
          </Button>
        )}
      </div>
      {filters.from && filters.to && filters.from > filters.to && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            Choose an end date on or after the start date.
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}

export function LgaTable({
  label,
  headers,
  rows,
  emptyTitle,
}: {
  label: string
  headers: string[]
  rows: { id: string; cells: ReactNode[] }[]
  emptyTitle: string
}) {
  if (!rows.length)
    return (
      <EmptyState
        title={emptyTitle}
        description="Try another search or choose different filters."
      />
    )
  return (
    <div className="min-w-0">
      <Table aria-label={label}>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="px-4">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {row.cells.map((cell, index) => (
                <TableCell key={headers[index]} className="px-4 py-4">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function LgaExport({
  csv,
  filename,
  disabled,
}: {
  csv: string
  filename: string
  disabled?: boolean
}) {
  const [error, setError] = useState("")
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
      )
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = filename
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setError("")
    } catch {
      setError("Unable to export this report. Please try again.")
    }
  }
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="min-h-11"
        disabled={disabled}
        onClick={download}
      >
        <Download aria-hidden="true" />
        Export
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
