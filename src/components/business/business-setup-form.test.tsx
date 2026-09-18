import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import type {
  BusinessDocument,
  BusinessPremisesInput,
} from "@/domain/business-types"
import { BusinessSetupForm } from "./business-setup-form"

beforeAll(() => vi.stubGlobal("PointerEvent", MouseEvent))
afterAll(() => vi.unstubAllGlobals())

const validPremises: BusinessPremisesInput = {
  premisesName: "Riverside Kitchen",
  businessType: "Restaurant",
  registrationNumber: "RC-12345",
  address: "12 Abonnema Wharf Road",
  ward: "Diobu",
  councilId: "phc",
}

function renderSetup(
  overrides: Partial<React.ComponentProps<typeof BusinessSetupForm>> = {}
) {
  const props: React.ComponentProps<typeof BusinessSetupForm> = {
    initialValues: validPremises,
    initialDocuments: [],
    contactEmail: "ada@riverside.ng",
    contactPhone: "08031234567",
    onSaveDraft: vi.fn().mockResolvedValue(undefined),
    onComplete: vi.fn().mockResolvedValue(undefined),
    onExit: vi.fn(),
    ...overrides,
  }
  render(<BusinessSetupForm {...props} />)
  return props
}

describe("BusinessSetupForm", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows required address and council errors when continuing", async () => {
    const onComplete = vi.fn()
    renderSetup({
      initialValues: { ...validPremises, address: "", councilId: "" },
      onComplete,
    })

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Save and continue" }))

    expect(
      screen.getByLabelText("Premises address")
    ).toHaveAccessibleDescription("Enter the premises address")
    expect(screen.getByLabelText("Council")).toHaveAccessibleDescription(
      "Choose a council"
    )
    expect(onComplete).not.toHaveBeenCalled()
  })

  it("shows council seed options and keeps document metadata only", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(undefined)
    renderSetup({ onSaveDraft })
    const user = userEvent.setup()

    const document = new File(["private document contents"], "permit.pdf", {
      type: "application/pdf",
    })
    await user.upload(screen.getByLabelText(/Supporting document/), document)
    expect(screen.getByText("permit.pdf")).toBeVisible()
    expect(screen.getByText(/metadata only/i)).toBeVisible()

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalled())
    const savedDocuments = onSaveDraft.mock.calls.at(
      -1
    )?.[1] as BusinessDocument[]
    expect(savedDocuments).toEqual([
      expect.objectContaining({
        name: "permit.pdf",
        size: document.size,
        category: "Supporting document",
      }),
    ])
    expect(savedDocuments[0]).not.toHaveProperty("contents")
  })

  it("rejects unsupported document types without changing the form", async () => {
    renderSetup()
    const document = new File(["script"], "payload.exe", {
      type: "application/octet-stream",
    })

    fireEvent.change(screen.getByLabelText(/Supporting document/), {
      target: { files: [document] },
    })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Upload a PDF, JPG, or PNG file"
    )
    expect(screen.queryByText("payload.exe")).not.toBeInTheDocument()
  })

  it("debounces changes and announces saving then saved", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(undefined)
    renderSetup({ onSaveDraft })
    const input = screen.getByLabelText("Premises name")

    await userEvent.setup().type(input, " Updated")
    expect(screen.getByRole("status")).toHaveTextContent("Saving…")
    expect(onSaveDraft).not.toHaveBeenCalled()

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(1))
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
  })

  it("shows a retry state after autosave rejection and retries without losing values", async () => {
    const onSaveDraft = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined)
    renderSetup({ onSaveDraft })
    const user = userEvent.setup()
    await user.clear(screen.getByLabelText("Ward"))
    await user.type(screen.getByLabelText("Ward"), "Oginigba")

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Couldn't save")
    )
    expect(screen.getByLabelText("Ward")).toHaveValue("Oginigba")
    await user.click(screen.getByRole("button", { name: "Retry save" }))
    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(2))
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
  })

  it("completes setup exactly once with the current premises and documents", async () => {
    let resolve!: () => void
    const pending = new Promise<void>((complete) => {
      resolve = complete
    })
    const onComplete = vi.fn().mockReturnValue(pending)
    renderSetup({ onComplete })
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Save and continue" }))

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledExactlyOnceWith(validPremises, [])
    )
    expect(
      screen.getByRole("button", { name: "Completing setup…" })
    ).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Completing setup…" }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolve()
      await pending
    })
  })

  it("saves a partial draft before exiting", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(undefined)
    const onExit = vi.fn()
    renderSetup({ onSaveDraft, onExit })
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Save draft and exit" }))

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(1))
    expect(onExit).toHaveBeenCalledExactlyOnceWith()
  })
})
