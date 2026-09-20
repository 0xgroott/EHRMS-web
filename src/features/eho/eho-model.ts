export type InspectionAnswer =
  "Satisfactory" | "Contravention" | "Not applicable" | "Unable to check"
export type FieldworkStatus = "draft" | "submitted" | "queued"

export interface Officer {
  id: string
  name: string
  email: string
  councilId: string
  disabled?: boolean
}

export interface Assignment {
  id: string
  premisesId: string
  type: string
  scheduledAt: string
  notice: "Served" | "Not served"
  acknowledgement: string
  officers: string[]
  kind: "Routine" | "Follow-up"
}

export interface ChecklistItem {
  id: string
  label: string
  section: string
  required: boolean
}
export interface Evidence {
  name: string
  type: string
  size: number
}
export interface Issue {
  id: string
  itemId: string
  description: string
  action: string
  deadline: string
  notes: string
  evidence?: Evidence
}
export interface Fieldwork {
  assignmentId: string
  status: FieldworkStatus
  answers: Partial<Record<string, InspectionAnswer>>
  notes: Record<string, string>
  issues: Issue[]
  attendingOfficers: string[]
  submittedAt?: string
}

export const officers: Officer[] = [
  {
    id: "EHO-001",
    name: "Ebi Briggs",
    email: "ebi.briggs@phc.gov.ng",
    councilId: "phc",
  },
  {
    id: "EHO-002",
    name: "Tamuno George",
    email: "tamuno.george@phc.gov.ng",
    councilId: "phc",
    disabled: true,
  },
]

export const assignments: Assignment[] = [
  {
    id: "EIN-101",
    premisesId: "PR-002",
    type: "Routine food premises inspection",
    scheduledAt: "2026-09-22",
    notice: "Served",
    acknowledgement: "Acknowledged by business",
    officers: ["Ebi Briggs"],
    kind: "Routine",
  },
  {
    id: "EIN-102",
    premisesId: "PR-003",
    type: "Routine cold store inspection",
    scheduledAt: "2026-09-24",
    notice: "Not served",
    acknowledgement: "Awaiting service",
    officers: ["Ebi Briggs"],
    kind: "Routine",
  },
  {
    id: "EIN-103",
    premisesId: "PR-001",
    type: "Food premises inspection",
    scheduledAt: "2026-09-20",
    notice: "Served",
    acknowledgement: "Acknowledged by business",
    officers: ["Ebi Briggs", "Tamuno George"],
    kind: "Routine",
  },
  {
    id: "EIN-104",
    premisesId: "PR-004",
    type: "Previous routine inspection",
    scheduledAt: "2026-09-10",
    notice: "Served",
    acknowledgement: "Acknowledged by business",
    officers: ["Ebi Briggs"],
    kind: "Routine",
  },
]

export const checklist: ChecklistItem[] = [
  {
    id: "food-storage",
    label: "Food storage",
    section: "Food safety",
    required: true,
  },
  {
    id: "waste-control",
    label: "Waste control",
    section: "Environment",
    required: true,
  },
  {
    id: "water-supply",
    label: "Safe water supply",
    section: "Facilities",
    required: true,
  },
]
