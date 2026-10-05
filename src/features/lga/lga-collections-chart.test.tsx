import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LgaCollectionsChart } from "./lga-collections-chart"
import type { LgaPayment } from "./lga-data"

const payment: LgaPayment = {
  id: "PAY-1",
  premisesId: "PR-001",
  businessName: "Riverside Kitchen",
  ward: "Diobu",
  service: "Fitness",
  paidAt: "2026-09-01",
  amount: 2000,
  refunded: 500,
  lgaShare: 500,
  paidOut: 0,
  status: "Partially refunded",
}

describe("LGA collections chart", () => {
  it("groups receipts by service, deducts refunds once and scales both bars from zero", () => {
    const { container } = render(
      <LgaCollectionsChart
        payments={[
          payment,
          { ...payment, id: "PAY-2", amount: 500, refunded: 0 },
          {
            ...payment,
            id: "PAY-3",
            service: "Fumigation",
            amount: 4000,
            refunded: 0,
          },
        ]}
      />
    )
    expect(screen.getByText("₦2,000")).toBeVisible()
    expect(screen.getByText("₦4,000")).toBeVisible()
    const bars = container.querySelectorAll('[data-slot="collection-bar"]')
    expect(bars[0]).toHaveStyle({ width: "50%" })
    expect(bars[1]).toHaveStyle({ width: "100%" })
  })
  it("keeps fully refunded collections at zero without invalid bar widths", () => {
    const { container } = render(
      <LgaCollectionsChart payments={[{ ...payment, refunded: 2000 }]} />
    )
    expect(screen.getAllByText("₦0")).toHaveLength(2)
    for (const bar of container.querySelectorAll(
      '[data-slot="collection-bar"]'
    ))
      expect(bar).toHaveStyle({ width: "0%" })
  })
  it("replaces the chart with an empty state when filters match no payments", () => {
    const { rerender, container } = render(
      <LgaCollectionsChart payments={[payment]} />
    )
    rerender(<LgaCollectionsChart payments={[]} />)
    expect(
      screen.getByText("No collections match these filters.")
    ).toBeVisible()
    expect(container.querySelector('[data-slot="collection-bar"]')).toBeNull()
  })
})
