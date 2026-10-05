import { useId } from "react"
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
