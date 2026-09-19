import type { InspectionFinding } from "./inspection-types"

export function seededInspectionFindings(
  noticeDate: string
): InspectionFinding[] {
  const base = new Date(noticeDate)
  const deadline = (days: number) => {
    const date = new Date(base)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString()
  }
  return [
    {
      id: "food-storage",
      title: "Food storage protection",
      action:
        "Keep dry goods in sealed, food-grade containers and off the floor.",
      deadline: deadline(14),
    },
    {
      id: "waste-control",
      title: "Waste handling",
      action:
        "Provide covered waste bins and maintain a daily disposal record.",
      deadline: deadline(21),
    },
  ]
}
