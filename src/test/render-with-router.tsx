import type { ReactNode } from "react"
import { render as renderComponent } from "@testing-library/react"
import type { RenderOptions } from "@testing-library/react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"

export function render(
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">
) {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: [
        window.location.pathname +
          window.location.search +
          window.location.hash,
      ],
    }),
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    )
  }
  return { ...renderComponent(ui, { ...options, wrapper: Wrapper }), router }
}
