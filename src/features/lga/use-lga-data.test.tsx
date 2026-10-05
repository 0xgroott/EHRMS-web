import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { LgaProvider } from "./lga-session"
import { useLgaData } from "./use-lga-data"

function Harness() {
  const data = useLgaData()
  return (
    <>
      <p role="status">{data.error || "Loaded"}</p>
      <p>
        {data.approvals.find((item) => item.id === "HA-REV-001")?.status ??
          "Unavailable"}
      </p>
    </>
  )
}
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("ehrcms:lga:session:v1", "LGA-001")
})
describe("LGA reads MOH decisions", () => {
  it("shows recorded approval outcomes without granting decision actions", () => {
    localStorage.setItem(
      "ehrcms:moh:MOH-001:decisions:v1",
      JSON.stringify({
        "HA-REV-001": {
          outcome: "approved",
          decidedAt: "2026-10-01",
          certificateNumber: "HAC-2026-001",
        },
      })
    )
    render(
      <LgaProvider>
        <Harness />
      </LgaProvider>
    )
    expect(screen.getByText("Approved", { exact: true })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Loaded")
  })
  it("reports malformed saved outcomes instead of silently treating them as awaiting decision", () => {
    localStorage.setItem(
      "ehrcms:moh:MOH-001:decisions:v1",
      JSON.stringify({
        "HA-REV-001": { outcome: "approved", decidedAt: "2026-10-01" },
      })
    )
    render(
      <LgaProvider>
        <Harness />
      </LgaProvider>
    )
    expect(screen.getByRole("status")).toHaveTextContent("could not be loaded")
    expect(screen.getByText("Unavailable")).toBeInTheDocument()
  })
})
