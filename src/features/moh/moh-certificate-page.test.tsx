import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { mohSubmissions } from "./moh-approvals"
import {
  MohCertificateDocument,
  MohCertificateView,
} from "./moh-certificate-page"

const approvedDecision = {
  outcome: "approved" as const,
  decidedAt: "2026-09-29T10:00:00.000Z",
  certificateNumber: "HAC-2026-001",
}

describe("MOH Health Approval Certificate", () => {
  it("shows the issued certificate details and decorative QR mark", () => {
    render(
      <MohCertificateDocument
        submission={mohSubmissions[0]}
        decision={approvedDecision}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Health Approval Certificate" })
    ).toBeInTheDocument()
    expect(screen.getByText("HAC-2026-001")).toBeInTheDocument()
    expect(screen.getByText("Riverside Kitchen & Foods")).toBeInTheDocument()
    expect(screen.getByText("Riverside Kitchen")).toBeInTheDocument()
    expect(screen.getByText("PR-001")).toBeInTheDocument()
    expect(
      screen.getByText("12 Abonnema Wharf Road, Diobu")
    ).toBeInTheDocument()
    expect(screen.getByText("INS-HA-1042")).toBeInTheDocument()
    expect(screen.getByText("Port Harcourt City Council")).toBeInTheDocument()
    expect(screen.getByText("29 September 2026")).toBeInTheDocument()
    expect(screen.getByTestId("certificate-qr-mark")).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })

  it("shows only the certificate and its top-right download action", () => {
    render(
      <MohCertificateView
        submission={mohSubmissions[0]}
        decision={approvedDecision}
      />
    )

    expect(
      screen.getByRole("button", { name: "Download certificate" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /back to decision/i })).toBeNull()
    expect(screen.queryByLabelText("MOH navigation")).toBeNull()
    expect(screen.queryByLabelText("MOH account")).toBeNull()
  })

  it("shows an unavailable state without an approved decision", () => {
    render(<MohCertificateDocument submission={mohSubmissions[0]} />)

    expect(
      screen.getByRole("heading", { name: "Certificate unavailable" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Return to decision queue" })
    ).toBeNull()
  })
})
