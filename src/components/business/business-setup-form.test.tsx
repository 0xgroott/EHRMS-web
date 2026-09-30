import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
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
    onSaveDraft: vi.fn().mockResolvedValue(undefined),
    onComplete: vi.fn().mockResolvedValue(undefined),
    onExit: vi.fn(),
    ...overrides,
  }
  render(<BusinessSetupForm {...props} />)
  return props
}

async function goToLocation(user = userEvent.setup()) {
  await user.click(screen.getByRole("button", { name: "Continue" }))
  return user
}

async function goToReview(user = userEvent.setup()) {
  await goToLocation(user)
  await user.click(screen.getByRole("button", { name: "Continue" }))
  return user
}

describe("BusinessSetupForm", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("presents the KYB fields as three focused steps", async () => {
    renderSetup()

    const progress = screen.getByRole("list", { name: "KYB progress" })
    expect(within(progress).getByText("Step 01")).toHaveAttribute(
      "aria-current",
      "step"
    )
    expect(within(progress).getByText("Step 02")).toBeVisible()
    expect(within(progress).getByText("Step 03")).toBeVisible()

    const businessDetails = screen.getByRole("group", {
      name: "Business details",
    })
    expect(
      within(businessDetails).getByLabelText("Premises name")
    ).toBeVisible()
    expect(
      within(businessDetails).getByLabelText("Business type")
    ).toBeVisible()
    expect(
      within(businessDetails).getByLabelText("Registration number (optional)")
    ).toBeVisible()
    expect(
      screen.queryByRole("group", { name: "Premises location" })
    ).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Continue" }))

    const premisesLocation = screen.getByRole("group", {
      name: "Premises location",
    })
    expect(
      within(premisesLocation).getByLabelText("Premises address")
    ).toBeVisible()
    expect(within(premisesLocation).getByLabelText("Ward")).toBeVisible()
    expect(within(premisesLocation).getByLabelText("Council")).toBeVisible()
    expect(
      screen.queryByRole("group", { name: "Business details" })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Continue" }))

    const contactAndDocuments = screen.getByRole("group", {
      name: "Documents and review",
    })
    expect(
      within(contactAndDocuments).getByLabelText("Account email")
    ).toBeVisible()
    expect(
      within(contactAndDocuments).getByText("ada@riverside.ng")
    ).toBeVisible()
    expect(
      within(contactAndDocuments).queryByText("Phone")
    ).not.toBeInTheDocument()
    expect(
      within(contactAndDocuments).getByLabelText(/Supporting document/)
    ).toBeVisible()
    expect(screen.getByRole("button", { name: "Complete KYB" })).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(
      screen.getByRole("group", { name: "Premises location" })
    ).toBeVisible()

    expect(
      screen.queryByRole("group", { name: "Registration details" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("group", { name: "Council and contact details" })
    ).not.toBeInTheDocument()
  })

  it("validates only the current step before continuing", async () => {
    renderSetup({
      initialValues: {
        ...validPremises,
        premisesName: "",
        businessType: "",
        address: "",
      },
    })

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByLabelText("Premises name")).toHaveAccessibleDescription(
      "Enter the premises name"
    )
    expect(screen.getByLabelText("Business type")).toHaveAccessibleDescription(
      "Choose a business type"
    )
    expect(
      screen.queryByText("Enter the premises address")
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("group", { name: "Business details" })
    ).toBeVisible()
  })

  it("shows required address and council errors when continuing", async () => {
    const onComplete = vi.fn()
    renderSetup({
      initialValues: { ...validPremises, address: "", councilId: "" },
      onComplete,
    })

    const user = await goToLocation()
    await user.click(screen.getByRole("button", { name: "Continue" }))

    expect(
      screen.getByLabelText("Premises address")
    ).toHaveAccessibleDescription("Enter the premises address")
    expect(screen.getByLabelText("Council")).toHaveAccessibleDescription(
      "Choose a council"
    )
    expect(onComplete).not.toHaveBeenCalled()
  })

  it("presents business type as a dropdown instead of an empty input", () => {
    renderSetup()
    const businessType = screen.getByRole("combobox", {
      name: "Business type",
    })
    expect(businessType).toHaveTextContent("Restaurant")
    expect(businessType).toHaveAttribute("aria-haspopup", "listbox")
    expect(
      screen.queryByRole("textbox", { name: "Business type" })
    ).not.toBeInTheDocument()
  })

  it("shows council seed options and keeps document metadata only", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(undefined)
    renderSetup({ onSaveDraft })
    const user = await goToReview()

    const document = new File(["private document contents"], "permit.pdf", {
      type: "application/pdf",
    })
    await user.upload(screen.getByLabelText(/Supporting document/), document)
    expect(screen.getByText("permit.pdf")).toBeVisible()

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
    await goToReview()
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
    const user = await goToLocation()
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
    const user = await goToReview()
    await user.click(screen.getByRole("button", { name: "Complete KYB" }))

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledExactlyOnceWith(validPremises, [])
    )
    expect(
      screen.getByRole("button", { name: "Completing KYB…" })
    ).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Completing KYB…" }))
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
      .click(screen.getByRole("button", { name: "Save draft" }))

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(1))
    expect(onExit).toHaveBeenCalledExactlyOnceWith()
  })

  it("cancels a pending autosave when setup is submitted", async () => {
    const onSaveDraft = vi.fn().mockResolvedValue(undefined)
    const onComplete = vi.fn().mockResolvedValue(undefined)
    renderSetup({ onSaveDraft, onComplete })
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Premises name"), " Updated")
    await goToReview(user)
    await user.click(screen.getByRole("button", { name: "Complete KYB" }))
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))

    await new Promise((resolve) => window.setTimeout(resolve, 650))
    expect(onSaveDraft).not.toHaveBeenCalled()
  })

  it("waits for an active draft save before completing and never writes after completion", async () => {
    let resolveDraft!: () => void
    const draftPending = new Promise<void>((resolve) => {
      resolveDraft = resolve
    })
    const events: string[] = []
    const onSaveDraft = vi.fn().mockImplementation(() => {
      events.push("draft-start")
      return draftPending.then(() => {
        events.push("draft-finished")
      })
    })
    const onComplete = vi.fn().mockImplementation(async () => {
      events.push("complete")
    })
    renderSetup({ onSaveDraft, onComplete })
    const user = await goToLocation()

    await user.type(screen.getByLabelText("Ward"), " Updated")
    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(1))
    await user.click(screen.getByRole("button", { name: "Continue" }))
    await user.click(screen.getByRole("button", { name: "Complete KYB" }))
    expect(onComplete).not.toHaveBeenCalled()

    resolveDraft()
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
    expect(events).toEqual(["draft-start", "draft-finished", "complete"])
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    expect(onSaveDraft).toHaveBeenCalledTimes(1)
  })

  it("keeps saving status until the newest edit has been persisted", async () => {
    let resolveFirst!: () => void
    let resolveSecond!: () => void
    const firstSave = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })
    const secondSave = new Promise<void>((resolve) => {
      resolveSecond = resolve
    })
    const onSaveDraft = vi
      .fn()
      .mockImplementationOnce(() => firstSave)
      .mockImplementationOnce(() => secondSave)
    renderSetup({ onSaveDraft })
    const user = await goToLocation()

    await user.type(screen.getByLabelText("Ward"), " first")
    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(1))
    await user.type(screen.getByLabelText("Ward"), " second")
    expect(screen.getByRole("status")).toHaveTextContent("Saving…")

    resolveFirst()
    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(2))
    expect(screen.getByRole("status")).toHaveTextContent("Saving…")
    resolveSecond()
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Saved")
    )
  })

  it("disables edits during rejected completion and preserves values for retry", async () => {
    let rejectCompletion!: (reason: Error) => void
    const firstCompletion = new Promise<void>((_, reject) => {
      rejectCompletion = reject
    })
    const onComplete = vi
      .fn()
      .mockImplementationOnce(() => firstCompletion)
      .mockResolvedValueOnce(undefined)
    renderSetup({ onComplete })
    const user = await goToReview()
    const documentInput = screen.getByLabelText(/Supporting document/)

    await user.click(screen.getByRole("button", { name: "Complete KYB" }))
    expect(
      await screen.findByRole("button", { name: "Completing KYB…" })
    ).toBeDisabled()
    expect(documentInput).toBeDisabled()

    rejectCompletion(new Error("completion unavailable"))
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to complete setup"
      )
    )
    expect(documentInput).toBeEnabled()

    await user.click(screen.getByRole("button", { name: "Complete KYB" }))
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(2))
    expect(onComplete).toHaveBeenLastCalledWith(validPremises, [])
  })
})
