import { assignments, checklist, officers } from "./eho-model"
import type {
  Assignment,
  Fieldwork,
  InspectionAnswer,
  Issue,
  Officer,
} from "./eho-model"

type StorageAdapter = Pick<Storage, "getItem" | "setItem">
const prefix = "ehrcms:eho:fieldwork:v1:"
const credential = "field-demo"

export function signInOfficer(
  contact: string,
  password: string
): Officer | null {
  const normalized = contact.trim().toLowerCase()
  return (
    officers.find(
      (officer) =>
        !officer.disabled &&
        (officer.email === normalized ||
          officer.id.toLowerCase() === normalized) &&
        password === credential
    ) ?? null
  )
}

export function accountError(contact: string, password: string): string {
  const officer = officers.find(
    (person) =>
      person.email === contact.trim().toLowerCase() ||
      person.id.toLowerCase() === contact.trim().toLowerCase()
  )
  if (officer?.disabled && password === credential)
    return "This account is disabled. Contact your administrator."
  return "Staff ID, email or password is incorrect."
}

export function canStart(assignment: Assignment): boolean {
  return assignment.notice === "Served"
}

function noticeAllows(draft: Fieldwork): boolean {
  const assignment = assignments.find((item) => item.id === draft.assignmentId)
  return !!assignment && canStart(assignment)
}

export function createDraft(assignment: Assignment): Fieldwork {
  return {
    assignmentId: assignment.id,
    status: "draft",
    answers: {},
    notes: {},
    issues: [],
    attendingOfficers: [...assignment.officers],
  }
}

export function saveAnswer(
  draft: Fieldwork,
  itemId: string,
  answer: InspectionAnswer
): Fieldwork {
  if (
    draft.status !== "draft" ||
    !noticeAllows(draft) ||
    !checklist.some((item) => item.id === itemId)
  )
    return draft
  return {
    ...draft,
    answers: { ...draft.answers, [itemId]: answer },
    issues:
      answer === "Contravention"
        ? draft.issues
        : draft.issues.filter((issue) => issue.itemId !== itemId),
  }
}

export function saveIssue(draft: Fieldwork, issue: Issue): Fieldwork {
  if (
    draft.status !== "draft" ||
    !noticeAllows(draft) ||
    !checklist.some((item) => item.id === issue.itemId)
  )
    return draft
  const issues = draft.issues.filter((existing) => existing.id !== issue.id)
  return {
    ...draft,
    answers: { ...draft.answers, [issue.itemId]: "Contravention" },
    issues: [...issues, issue],
  }
}

export function reviewErrors(draft: Fieldwork): string[] {
  const errors: string[] = []
  for (const item of checklist) {
    if (item.required && draft.answers[item.id] === undefined)
      errors.push(`${item.label} needs an answer.`)
    if (
      draft.answers[item.id] === "Contravention" &&
      !draft.issues.some(
        (issue) =>
          issue.itemId === item.id &&
          issue.description.trim() &&
          issue.action.trim() &&
          issue.deadline.trim()
      )
    )
      errors.push(`${item.label} needs a complete contravention.`)
  }
  if (!draft.attendingOfficers.some((name) => name.trim()))
    errors.push("Enter an attending officer.")
  return errors
}

export function submitInspection(
  draft: Fieldwork,
  offline: boolean,
  now = new Date().toISOString()
): Fieldwork {
  if (draft.status !== "draft") return draft
  if (!noticeAllows(draft))
    throw new Error("The required notice must be served before submission.")
  if (reviewErrors(draft).length)
    throw new Error("Complete the checklist before submitting.")
  return {
    ...draft,
    status: offline ? "queued" : "submitted",
    submittedAt: now,
  }
}

function validFieldwork(value: unknown, id: string): value is Fieldwork {
  if (!value || typeof value !== "object") return false
  const draft = value as Partial<Fieldwork>
  return (
    draft.assignmentId === id &&
    ["draft", "submitted", "queued"].includes(draft.status ?? "") &&
    !!draft.answers &&
    typeof draft.answers === "object" &&
    !Array.isArray(draft.answers) &&
    Object.entries(draft.answers).every(
      ([itemId, answer]) =>
        checklist.some((item) => item.id === itemId) &&
        typeof answer === "string" &&
        [
          "Satisfactory",
          "Contravention",
          "Not applicable",
          "Unable to check",
        ].includes(answer)
    ) &&
    !!draft.notes &&
    typeof draft.notes === "object" &&
    !Array.isArray(draft.notes) &&
    Object.entries(draft.notes).every(
      ([itemId, note]) =>
        checklist.some((item) => item.id === itemId) && typeof note === "string"
    ) &&
    Array.isArray(draft.issues) &&
    draft.issues.every(
      (issue) =>
        typeof issue.id === "string" &&
        checklist.some((item) => item.id === issue.itemId) &&
        typeof issue.description === "string" &&
        typeof issue.action === "string" &&
        typeof issue.deadline === "string" &&
        typeof issue.notes === "string" &&
        (!issue.evidence ||
          (typeof issue.evidence.name === "string" &&
            typeof issue.evidence.type === "string" &&
            typeof issue.evidence.size === "number"))
    ) &&
    Array.isArray(draft.attendingOfficers) &&
    draft.attendingOfficers.every((name) => typeof name === "string") &&
    (draft.status === "draft" || typeof draft.submittedAt === "string")
  )
}

export function readFieldwork(
  storage: Pick<StorageAdapter, "getItem"> | null,
  officerId: string
): Partial<Record<string, Fieldwork>> {
  if (!storage) return {}
  try {
    const raw = storage.getItem(prefix + officerId)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {}
    const entries = Object.entries(parsed).filter(
      ([id, value]) =>
        assignments.some((assignment) => assignment.id === id) &&
        validFieldwork(value, id)
    )
    return Object.fromEntries(entries)
  } catch {
    return {}
  }
}

export function saveFieldwork(
  storage: Pick<StorageAdapter, "setItem">,
  officerId: string,
  state: Partial<Record<string, Fieldwork>>
): void {
  storage.setItem(prefix + officerId, JSON.stringify(state))
}

export function initialFieldwork(): Partial<Record<string, Fieldwork>> {
  const draft = saveAnswer(
    createDraft(assignments[2]),
    "food-storage",
    "Satisfactory"
  )
  const completed = assignments[3]
  let finished = createDraft(completed)
  for (const item of checklist)
    finished = saveAnswer(finished, item.id, "Satisfactory")
  finished = saveIssue(finished, {
    id: "ISS-EIN-104-1",
    itemId: "waste-control",
    description: "Waste bins were left uncovered near the preparation area.",
    action: "Provide covered bins and keep a daily disposal record.",
    deadline: "2026-09-18",
    notes: "Follow-up required to verify the corrective action.",
  })
  return {
    [draft.assignmentId]: draft,
    [completed.id]: submitInspection(
      finished,
      false,
      "2026-09-10T12:00:00.000Z"
    ),
  }
}
