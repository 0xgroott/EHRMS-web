import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it } from "vitest"
import { officers } from "./eho-model"
import { EhoProvider, useEho } from "./eho-session"
import { saveAnswer } from "./eho-state"

function SessionHarness() {
  const session = useEho()
  return (
    <div>
      <p>{session.hydrated ? "Ready" : "Loading"}</p>
      <button onClick={() => session.signIn(officers[0])}>
        Assigned sign-in
      </button>
      <button
        onClick={() =>
          session.updateDraft(
            saveAnswer(
              session.getDraft("EIN-101"),
              "food-storage",
              "Satisfactory"
            )
          )
        }
      >
        Save answer
      </button>
      <p>
        {session.fieldwork["EIN-101"]?.answers["food-storage"] ?? "No answer"}
      </p>
    </div>
  )
}

describe("EHO session and query state", () => {
  beforeEach(() => localStorage.clear())
  it("keeps the saved fieldwork query in sync with local updates", async () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <EhoProvider>
          <SessionHarness />
        </EhoProvider>
      </QueryClientProvider>
    )
    await screen.findByText("Ready")
    fireEvent.click(screen.getByText("Assigned sign-in"))
    fireEvent.click(screen.getByText("Save answer"))
    await waitFor(() =>
      expect(screen.getByText("Satisfactory")).toBeInTheDocument()
    )
    expect(
      queryClient.getQueryData<unknown>(["eho", "fieldwork", "EHO-001"])
    ).toMatchObject({
      "EIN-101": { answers: { "food-storage": "Satisfactory" } },
    })
  })
})
