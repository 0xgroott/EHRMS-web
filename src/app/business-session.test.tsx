import { act, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"
import {
  emptyBusinessState,
  ONBOARDING_BUSINESS_CREDENTIALS,
  returningBusinessState,
} from "@/data/business-seeds"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessSessionProvider, useBusinessSession } from "./business-session"

const { businessStateQuery } = vi.hoisted(() => ({
  businessStateQuery: vi.fn(),
}))

vi.mock("@/services/business-query-options", () => ({
  businessQueryKeys: { state: ["business", "state"] },
  businessStateOptions: () => ({
    queryKey: ["business", "state"],
    queryFn: businessStateQuery,
  }),
}))

let latestSession: ReturnType<typeof useBusinessSession> | null = null

function Harness() {
  const session = useBusinessSession()

  return (
    <>
      <span data-testid="authenticated">{String(session.isAuthenticated)}</span>
      <span data-testid="business-name">
        {session.state.profile?.businessName ?? "none"}
      </span>
      <span data-testid="stage">{session.state.stage}</span>
      <button onClick={() => void session.signInDemo()}>Sign in</button>
      <button onClick={session.signOut}>Sign out</button>
      <button onClick={() => void session.refresh()}>Refresh</button>
    </>
  )
}

function SessionProbe() {
  latestSession = useBusinessSession()
  return <span data-testid="probe-stage">{latestSession.state.stage}</span>
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((complete) => {
    resolve = complete
  })
  return { promise, resolve }
}

function renderSession(children: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <BusinessSessionProvider>{children}</BusinessSessionProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  latestSession = null
  businessStateQuery.mockReset()
  businessStateQuery.mockImplementation(() =>
    createBusinessRepository(createBusinessStorage(localStorage)).getState()
  )
})

it("starts signed out with an empty business state", () => {
  renderSession(<Harness />)

  expect(screen.getByTestId("authenticated")).toHaveTextContent("false")
  expect(screen.getByTestId("business-name")).toHaveTextContent("none")
  expect(screen.getByTestId("stage")).toHaveTextContent("account")
})

it("signs in the returning demo business", async () => {
  renderSession(<Harness />)

  await userEvent.setup().click(screen.getByRole("button", { name: "Sign in" }))

  await waitFor(() => {
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true")
  })
  expect(screen.getByTestId("business-name")).toHaveTextContent(
    "Riverside Kitchen & Foods"
  )
  expect(screen.getByTestId("stage")).toHaveTextContent("complete")
})

it("starts the reusable onboarding account as a verified blank identity", async () => {
  renderSession(<SessionProbe />)
  await waitFor(() => expect(latestSession?.isHydrated).toBe(true))

  act(() => {
    latestSession?.signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )
  })

  expect(latestSession?.isAuthenticated).toBe(true)
  expect(latestSession?.state).toMatchObject({
    stage: "account",
    profile: {
      businessName: "",
      contactName: "",
      verified: true,
    },
  })
})

it("signs out and resets the business session", async () => {
  renderSession(<Harness />)
  const user = userEvent.setup()

  await user.click(screen.getByRole("button", { name: "Sign in" }))
  await user.click(screen.getByRole("button", { name: "Sign out" }))

  expect(screen.getByTestId("authenticated")).toHaveTextContent("false")
  expect(screen.getByTestId("business-name")).toHaveTextContent("none")
  expect(screen.getByTestId("stage")).toHaveTextContent("account")
})

it("refreshes from the business repository state", async () => {
  renderSession(<Harness />)
  const user = userEvent.setup()

  await user.click(screen.getByRole("button", { name: "Sign in" }))
  await waitFor(() => {
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true")
  })
  createBusinessRepository(createBusinessStorage(localStorage)).reset()
  await user.click(screen.getByRole("button", { name: "Refresh" }))

  await waitFor(() => {
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false")
  })
  expect(screen.getByTestId("stage")).toHaveTextContent("account")
})

it("keeps a sign-out newer than an in-flight refresh in context and cache", async () => {
  createBusinessRepository(createBusinessStorage(localStorage)).signInDemo(
    "ada@riverside.ng",
    "riverside-demo"
  )
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <BusinessSessionProvider>
        <SessionProbe />
      </BusinessSessionProvider>
    </QueryClientProvider>
  )

  await waitFor(() => {
    expect(latestSession?.isHydrated).toBe(true)
  })
  const staleState = deferred<typeof returningBusinessState>()
  businessStateQuery.mockImplementationOnce(() => staleState.promise)

  const refreshPromise = latestSession?.refresh()
  await waitFor(() => {
    expect(businessStateQuery).toHaveBeenCalledTimes(2)
  })
  act(() => latestSession?.signOut())
  staleState.resolve(structuredClone(returningBusinessState))
  await act(async () => {
    await refreshPromise
  })

  expect(latestSession?.isAuthenticated).toBe(false)
  expect(latestSession?.state).toEqual(emptyBusinessState)
  expect(queryClient.getQueryData(["business", "state"])).toEqual(
    emptyBusinessState
  )
})

it("keeps a demo sign-in newer than an in-flight refresh in context and cache", async () => {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <BusinessSessionProvider>
        <SessionProbe />
      </BusinessSessionProvider>
    </QueryClientProvider>
  )

  await waitFor(() => {
    expect(latestSession?.isHydrated).toBe(true)
  })
  const staleState = deferred<typeof emptyBusinessState>()
  businessStateQuery.mockImplementationOnce(() => staleState.promise)

  const refreshPromise = latestSession?.refresh()
  await waitFor(() => {
    expect(businessStateQuery).toHaveBeenCalledTimes(2)
  })
  act(() => latestSession?.signInDemo())
  staleState.resolve(structuredClone(emptyBusinessState))
  await act(async () => {
    await refreshPromise
  })

  expect(latestSession?.isAuthenticated).toBe(true)
  expect(latestSession?.state).toEqual(returningBusinessState)
  expect(queryClient.getQueryData(["business", "state"])).toEqual(
    returningBusinessState
  )
})

it("does not read storage while importing or server rendering", async () => {
  const getItem = vi.spyOn(Storage.prototype, "getItem")
  vi.resetModules()

  await import("./business-session")
  renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <BusinessSessionProvider>
        <span>Business portal</span>
      </BusinessSessionProvider>
    </QueryClientProvider>
  )

  expect(getItem).not.toHaveBeenCalled()
  expect(emptyBusinessState.stage).toBe("account")
})
