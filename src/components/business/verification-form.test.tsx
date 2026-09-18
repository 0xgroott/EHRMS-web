import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { VerificationForm } from "./verification-form"

function renderVerification(
  overrides: Partial<React.ComponentProps<typeof VerificationForm>> = {}
) {
  const props: React.ComponentProps<typeof VerificationForm> = {
    maskedDestination: "a***@riverside.ng",
    onVerify: vi.fn(),
    onResend: vi.fn(),
    onChangeContact: vi.fn(),
    ...overrides,
  }
  render(<VerificationForm {...props} />)
  return props
}

function enterCode(code: string) {
  fireEvent.change(screen.getByLabelText("6-digit verification code"), {
    target: { value: code },
  })
}

describe("VerificationForm", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows the demo code hint and masked registration destination", () => {
    renderVerification()

    expect(screen.getByText("Use code 123456")).toBeVisible()
    expect(screen.getByText("a***@riverside.ng")).toBeVisible()
  })

  it("provides one labelled numeric six-digit input", () => {
    renderVerification()

    const input = screen.getByLabelText("6-digit verification code")
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("maxlength", "6")
  })

  it("shows expiry independently of cooldown and recovers after resend", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-18T12:00:00Z"))
    const expiresAt = Date.now() + 300_000
    const onVerify = vi.fn()
    const onResend = vi
      .fn()
      .mockImplementation(() => ({ expiresAt: Date.now() + 300_000 }))
    renderVerification({ expiresAt, onVerify, onResend })
    act(() => vi.advanceTimersByTime(60_000))
    expect(
      screen.queryByText("This code has expired. Request a new code.")
    ).not.toBeInTheDocument()
    act(() => {
      vi.setSystemTime(Date.now() + 240_000)
      vi.advanceTimersByTime(1000)
    })
    expect(
      screen.getByText("This code has expired. Request a new code.")
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Verify and continue" })
    ).toBeDisabled()
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Resend code" }))
    })
    expect(
      screen.queryByText("This code has expired. Request a new code.")
    ).not.toBeInTheDocument()
    enterCode("123456")
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Verify and continue" })
      )
    })
    expect(onVerify).toHaveBeenCalledWith("123456")
  })

  it("shows a wrong-code error without clearing the entered code", async () => {
    const onVerify = vi
      .fn()
      .mockResolvedValue({ error: "Enter the demo code 123456" })
    renderVerification({ onVerify })
    enterCode("000000")

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Verify and continue" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the demo code 123456"
    )
    expect(screen.getByLabelText("6-digit verification code")).toHaveValue(
      "000000"
    )
    expect(onVerify).toHaveBeenCalledExactlyOnceWith("000000")
  })

  it("calls the verify action once for the correct code", async () => {
    const onVerify = vi.fn().mockResolvedValue(undefined)
    renderVerification({ onVerify })
    enterCode("123456")

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Verify and continue" }))

    await waitFor(() =>
      expect(onVerify).toHaveBeenCalledExactlyOnceWith("123456")
    )
  })

  it("blocks duplicate verify submits while the action is pending", async () => {
    let resolve!: () => void
    const pending = new Promise<void>((complete) => {
      resolve = complete
    })
    const onVerify = vi.fn().mockReturnValue(pending)
    renderVerification({ onVerify })
    enterCode("123456")
    const user = userEvent.setup()

    await user.click(
      screen.getByRole("button", { name: "Verify and continue" })
    )
    expect(screen.getByRole("button", { name: "Verifying…" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Verifying…" }))
    expect(onVerify).toHaveBeenCalledExactlyOnceWith("123456")

    await act(async () => {
      resolve()
      await pending
    })
    expect(
      screen.getByRole("button", { name: "Verify and continue" })
    ).toBeEnabled()
  })

  it("counts down from 60 and enables resend at zero", () => {
    vi.useFakeTimers()
    renderVerification()

    expect(screen.getByText("Resend code in 60 seconds")).toBeVisible()
    expect(screen.getByRole("button", { name: "Resend code" })).toBeDisabled()

    act(() => vi.advanceTimersByTime(60_000))

    expect(screen.getByText("You can request a new code now.")).toBeVisible()
    expect(screen.getByRole("button", { name: "Resend code" })).toBeEnabled()
  })

  it("makes resend available when an expired tab resumes after timers were suspended", () => {
    vi.useFakeTimers()
    const issuedAt = Date.now()
    renderVerification({ expiresAt: issuedAt + 300_000 })
    act(() => {
      vi.setSystemTime(issuedAt + 300_000)
      vi.advanceTimersByTime(1000)
    })
    expect(
      screen.getByText("This code has expired. Request a new code.")
    ).toBeVisible()
    expect(screen.getByRole("button", { name: "Resend code" })).toBeEnabled()
  })

  it("resends at zero, resets to 60, and announces feedback", async () => {
    vi.useFakeTimers()
    const onResend = vi.fn().mockResolvedValue(undefined)
    renderVerification({ onResend })
    act(() => vi.advanceTimersByTime(60_000))

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Resend code" }))
      await Promise.resolve()
    })
    expect(onResend).toHaveBeenCalledExactlyOnceWith()
    expect(screen.getByText("Resend code in 60 seconds")).toBeVisible()
    expect(screen.getByRole("status")).toHaveTextContent(
      "A new verification code has been sent."
    )
  })

  it("stops after three resend attempts and shows a clear limit", async () => {
    vi.useFakeTimers()
    const onResend = vi.fn().mockResolvedValue(undefined)
    renderVerification({ onResend })

    for (let attempt = 0; attempt < 3; attempt += 1) {
      act(() => vi.advanceTimersByTime(60_000))
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Resend code" }))
        await Promise.resolve()
      })
      expect(onResend).toHaveBeenCalledTimes(attempt + 1)
    }

    expect(screen.getByRole("button", { name: "Resend code" })).toBeDisabled()
    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByRole("status")).toHaveTextContent(
      "You have reached the maximum of 3 resend attempts."
    )
  })

  it("lets the user change the contact", async () => {
    const onChangeContact = vi.fn()
    renderVerification({ onChangeContact })

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Change contact" }))

    expect(onChangeContact).toHaveBeenCalledExactlyOnceWith()
  })

  it("recovers from rejected verify and resend actions without losing input", async () => {
    vi.useFakeTimers()
    const onVerify = vi
      .fn()
      .mockRejectedValueOnce(new Error("verify failed"))
      .mockResolvedValueOnce(undefined)
    const onResend = vi.fn().mockRejectedValueOnce(new Error("resend failed"))
    renderVerification({ onVerify, onResend })
    enterCode("123456")
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Verify and continue" })
      )
      await Promise.resolve()
    })
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to verify your code. Please try again."
    )
    expect(screen.getByLabelText("6-digit verification code")).toHaveValue(
      "123456"
    )
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Verify and continue" })
      )
      await Promise.resolve()
    })
    expect(onVerify).toHaveBeenCalledTimes(2)

    act(() => vi.advanceTimersByTime(60_000))
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Resend code" }))
      await Promise.resolve()
    })
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to send a new code. Please try again."
    )
    expect(screen.getByLabelText("6-digit verification code")).toHaveValue(
      "123456"
    )
  })
})
