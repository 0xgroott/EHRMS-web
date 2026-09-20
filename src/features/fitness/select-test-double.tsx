import { createContext, useContext } from "react"
import type { ComponentProps, ReactNode } from "react"

type Option = { value: string; label: string }
type SelectState = {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  items?: readonly Option[]
}

const Context = createContext<SelectState | null>(null)

export function Select({
  children,
  ...state
}: SelectState & { children: ReactNode }) {
  return <Context.Provider value={state}>{children}</Context.Provider>
}

export function SelectTrigger(props: ComponentProps<"select">) {
  const state = useContext(Context)
  if (!state) throw new Error("SelectTrigger requires Select")
  const options = state.items ?? [
    { value: "Female", label: "Female" },
    { value: "Male", label: "Male" },
  ]
  return (
    <select
      {...props}
      value={state.value}
      disabled={state.disabled}
      onChange={(event) => state.onValueChange(event.target.value)}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function SelectValue() {
  return null
}

export function SelectContent() {
  return null
}

export function SelectGroup() {
  return null
}

export function SelectLabel() {
  return null
}

export function SelectItem() {
  return null
}
