import { beforeEach, describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import {
  assignedLgaAccount,
  assignedLgaCredentials,
  matchLgaAccount,
  verifyLgaCode,
} from "./lga-account"
import { LgaProvider, useLga } from "./lga-session"

beforeEach(() => localStorage.clear())
function Harness() {
  const session = useLga()
  return (
    <>
      <p>{session.account?.councilId ?? "signed out"}</p>
      <button
        onClick={() =>
          session.signIn({ ...assignedLgaAccount, councilId: "obio" })
        }
      >
        Sign in
      </button>
      <button onClick={session.signOut}>Sign out</button>
    </>
  )
}
describe("LGA assigned account", () => {
  it("matches assigned staff ID or email but rejects other credentials and verification codes", () => {
    expect(
      matchLgaAccount(
        ` ${assignedLgaAccount.id.toLowerCase()} `,
        assignedLgaCredentials.password
      )
    ).toEqual(assignedLgaAccount)
    expect(
      matchLgaAccount(
        assignedLgaAccount.email.toUpperCase(),
        assignedLgaCredentials.password
      )
    ).toEqual(assignedLgaAccount)
    expect(
      matchLgaAccount("MOH-001", assignedLgaCredentials.password)
    ).toBeNull()
    expect(matchLgaAccount(assignedLgaAccount.id, "wrong")).toBeNull()
    expect(verifyLgaCode("000000")).toBe(false)
    expect(verifyLgaCode(assignedLgaCredentials.verificationCode)).toBe(true)
  })
  it("uses canonical council assignment, persists only account ID and signs out", () => {
    render(
      <LgaProvider>
        <Harness />
      </LgaProvider>
    )
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(screen.getByText("phc")).toBeInTheDocument()
    expect(localStorage.getItem("ehrcms:lga:session:v1")).toBe(
      assignedLgaAccount.id
    )
    expect(JSON.stringify(localStorage)).not.toContain(
      assignedLgaCredentials.password
    )
    expect(JSON.stringify(localStorage)).not.toContain(
      assignedLgaCredentials.verificationCode
    )
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }))
    expect(screen.getByText("signed out")).toBeInTheDocument()
    expect(localStorage.getItem("ehrcms:lga:session:v1")).toBeNull()
  })
  it("does not accept a MOH session or forged stored council", () => {
    localStorage.setItem("ehrcms:moh:session:v1", "MOH-001")
    localStorage.setItem(
      "ehrcms:lga:session:v1",
      JSON.stringify({ ...assignedLgaAccount, councilId: "obio" })
    )
    render(
      <LgaProvider>
        <Harness />
      </LgaProvider>
    )
    expect(screen.getByText("signed out")).toBeInTheDocument()
  })
})
