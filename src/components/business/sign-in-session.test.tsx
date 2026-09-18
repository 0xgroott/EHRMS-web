import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import userEvent from "@testing-library/user-event"
import { expect, it } from "vitest"
import {
  BusinessSessionProvider,
  useBusinessSession,
} from "@/app/business-session"
import {
  DEMO_BUSINESS_CREDENTIALS,
  returningBusinessState,
} from "@/data/business-seeds"
import { businessQueryKeys } from "@/services/business-query-options"
import { createBusinessStorage, STORAGE_KEY } from "@/services/business-storage"
import { SignInForm } from "./sign-in-form"

function SessionSignIn() {
  const session = useBusinessSession()
  return (
    <>
      <span data-testid="session-status">
        {session.isHydrated ? "ready" : "loading"}
      </span>
      <span data-testid="signed-in-business">
        {session.isAuthenticated
          ? session.state.profile?.businessName
          : "signed out"}
      </span>
      <SignInForm
        onSubmit={({ contact, password }) => {
          const result = session.signInDemo(contact, password)
          if (!result.ok)
            return { error: Object.values(result.errors).find(Boolean) }
        }}
        createAccountLink={<a href="/business/register">Create account</a>}
      />
    </>
  )
}

it.each(["ada@riverside.ng", "08031234567"])(
  "signs in %s through the form, session and repository",
  async (contact) => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BusinessSessionProvider>
          <SessionSignIn />
        </BusinessSessionProvider>
      </QueryClientProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId("session-status")).toHaveTextContent("ready")
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText("Email or phone number"), contact)
    await user.type(
      screen.getByLabelText("Password"),
      DEMO_BUSINESS_CREDENTIALS.password
    )
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    await waitFor(() =>
      expect(screen.getByTestId("signed-in-business")).toHaveTextContent(
        "Riverside Kitchen & Foods"
      )
    )
    expect(createBusinessStorage(localStorage).read()).toEqual(
      returningBusinessState
    )
    expect(queryClient.getQueryData(businessQueryKeys.state)).toEqual(
      returningBusinessState
    )
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain(
      DEMO_BUSINESS_CREDENTIALS.password
    )
  }
)
