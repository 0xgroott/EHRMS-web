import { queryOptions } from "@tanstack/react-query"
import { createBusinessRepository } from "./business-repository"
import { createBusinessStorage } from "./business-storage"

export const businessQueryKeys = {
  state: ["business", "state"] as const,
  dashboard: ["business", "dashboard"] as const,
}

export const businessStateOptions = () =>
  queryOptions({
    queryKey: businessQueryKeys.state,
    queryFn: () => createBusinessRepository(createBusinessStorage()).getState(),
  })
