import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { beforeEach, expect, it, vi } from "vitest"
import { emptyBusinessState } from "@/data/business-seeds"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessSessionProvider, useBusinessSession } from "./business-session"

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

function renderSession(children: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <BusinessSessionProvider>{children}</BusinessSessionProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
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
