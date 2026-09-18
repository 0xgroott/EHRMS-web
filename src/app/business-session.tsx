import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  DEMO_BUSINESS_CREDENTIALS,
  emptyBusinessState,
} from "@/data/business-seeds"
import type { BusinessPortalState } from "@/domain/business-types"
import type { BusinessRepositoryResult } from "@/services/business-repository"
import { createBusinessRepository } from "@/services/business-repository"
import {
  businessQueryKeys,
  businessStateOptions,
} from "@/services/business-query-options"
import { createBusinessStorage } from "@/services/business-storage"

type BusinessSession = {
  state: BusinessPortalState
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  signInDemo: (contact?: string, password?: string) => BusinessRepositoryResult
  signOut: () => void
  refresh: () => Promise<BusinessPortalState | null>
}

const BusinessSessionContext = createContext<BusinessSession | null>(null)

function emptyState() {
  return structuredClone(emptyBusinessState)
}

function errorMessage(result: BusinessRepositoryResult) {
  if (result.ok) return null

  return (
    Object.values(result.errors).find(
      (message): message is string => typeof message === "string"
    ) ?? "Unable to update the business session"
  )
}

export function BusinessSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<BusinessPortalState>(emptyState)
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const operation = useRef(0)
  const isMounted = useRef(false)

  const discardStaleRefreshes = useCallback(() => {
    operation.current += 1
    void queryClient.cancelQueries({
      queryKey: businessQueryKeys.state,
      exact: true,
    })
  }, [queryClient])

  const refresh = useCallback(async () => {
    const refreshOperation = operation.current

    try {
      const nextState = await queryClient.fetchQuery({
        ...businessStateOptions(),
        staleTime: 0,
      })
      if (!isMounted.current || refreshOperation !== operation.current) {
        return null
      }
      setState(nextState)
      setError(null)
      return nextState
    } catch {
      if (isMounted.current && refreshOperation === operation.current) {
        setError("Unable to load the business session")
      }
      return null
    }
  }, [queryClient])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void refresh().finally(() => {
      if (active) setIsHydrated(true)
    })
    return () => {
      active = false
    }
  }, [refresh])

  const signInDemo = useCallback(
    (
      contact: string = DEMO_BUSINESS_CREDENTIALS.contact,
      password: string = DEMO_BUSINESS_CREDENTIALS.password
    ) => {
      try {
        discardStaleRefreshes()
        const result = createBusinessRepository(
          createBusinessStorage()
        ).signInDemo(contact, password)
        setError(errorMessage(result))

        if (result.ok) {
          setState(result.state)
          queryClient.setQueryData(businessQueryKeys.state, result.state)
        }

        return result
      } catch {
        const result: BusinessRepositoryResult = {
          ok: false,
          errors: { state: "Unable to update the business session" },
        }
        setError(errorMessage(result))
        return result
      }
    },
    [discardStaleRefreshes, queryClient]
  )

  const signOut = useCallback(() => {
    try {
      discardStaleRefreshes()
      createBusinessRepository(createBusinessStorage()).reset()
      const nextState = emptyState()
      setState(nextState)
      queryClient.setQueryData(businessQueryKeys.state, nextState)
      setError(null)
    } catch {
      setError("Unable to clear the business session")
    }
  }, [discardStaleRefreshes, queryClient])

  const value = useMemo(
    () => ({
      state,
      isAuthenticated: state.profile !== null,
      isHydrated,
      isLoading: !isHydrated,
      error,
      signInDemo,
      signOut,
      refresh,
    }),
    [error, isHydrated, refresh, signInDemo, signOut, state]
  )

  return (
    <BusinessSessionContext.Provider value={value}>
      {children}
    </BusinessSessionContext.Provider>
  )
}

export function useBusinessSession() {
  const value = useContext(BusinessSessionContext)
  if (!value) {
    throw new Error(
      "useBusinessSession must be used within BusinessSessionProvider"
    )
  }
  return value
}
