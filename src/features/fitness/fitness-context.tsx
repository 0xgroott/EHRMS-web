import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useBusinessSession } from "@/app/business-session"
import { findApprovedFitnessFacility } from "./fitness-seeds"
import {
  beginApplication,
  chooseFacility as chooseFacilityRule,
  confirmDemoPayment as confirmDemoPaymentRule,
  issueDemoCertificate as issueDemoCertificateRule,
  recordFitResult as recordFitResultRule,
} from "./fitness-rules"
import { createFitnessStore, emptyFitnessState } from "./fitness-store"
import type {
  FitnessApplication,
  FitnessRuleResult,
  FitnessState,
  FoodHandler,
  FoodHandlerInput,
} from "./fitness-types"

type FitnessContextValue = {
  state: FitnessState
  isHydrated: boolean
  addHandler: (handler: FoodHandlerInput) => FoodHandler
  updateHandler: (
    id: string,
    changes: Partial<FoodHandlerInput>
  ) => FitnessRuleResult<FoodHandler>
  selectHandlers: (
    handlerIds: string[]
  ) => FitnessRuleResult<FitnessApplication>
  chooseFacility: (facilityId: string) => FitnessRuleResult<FitnessApplication>
  confirmDemoPayment: () => FitnessRuleResult<FitnessApplication>
  recordFitResult: () => FitnessRuleResult<FitnessApplication>
  issueDemoCertificate: () => FitnessRuleResult<FitnessApplication>
}

const FitnessContext = createContext<FitnessContextValue | null>(null)

export function FitnessProvider({ children }: { children: React.ReactNode }) {
  const { state: businessState, isHydrated: businessIsHydrated } =
    useBusinessSession()
  const profile = businessState.profile
  const profileId = profile?.id ?? null
  const store = useMemo(() => createFitnessStore(), [])
  const [state, setState] = useState<FitnessState>(emptyFitnessState)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (!businessIsHydrated) return
    setState(profileId ? store.read(profileId) : emptyFitnessState())
    setIsHydrated(true)
    return profileId ? store.subscribe(profileId, setState) : undefined
  }, [businessIsHydrated, profileId, store])

  const save = useCallback(
    (nextState: FitnessState) => {
      if (profileId) store.write(profileId, nextState)
      setState(nextState)
    },
    [profileId, store]
  )

  const noProfile = useCallback(
    (): FitnessRuleResult<never> => ({
      ok: false,
      error: "A signed-in business profile is required",
    }),
    []
  )

  const addHandler = useCallback(
    (handler: FoodHandlerInput) => {
      const nextHandler: FoodHandler = {
        ...handler,
        id: `fitness-handler-${state.handlers.length + 1}`,
      }
      save({ ...state, handlers: [...state.handlers, nextHandler] })
      return nextHandler
    },
    [save, state]
  )

  const updateHandler = useCallback(
    (
      id: string,
      changes: Partial<FoodHandlerInput>
    ): FitnessRuleResult<FoodHandler> => {
      const existing = state.handlers.find((handler) => handler.id === id)
      if (!existing) return { ok: false, error: "Food handler not found" }
      const updated = { ...existing, ...changes, id: existing.id }
      save({
        ...state,
        handlers: state.handlers.map((handler) =>
          handler.id === id ? updated : handler
        ),
      })
      return { ok: true, value: updated }
    },
    [save, state]
  )

  const selectHandlers = useCallback(
    (handlerIds: string[]): FitnessRuleResult<FitnessApplication> => {
      if (!profileId) return noProfile()
      const result = beginApplication(
        state.handlers,
        handlerIds,
        "fitness-demo-application",
        state.application
      )
      if (result.ok) save({ ...state, application: result.value })
      return result
    },
    [noProfile, profileId, save, state]
  )

  const updateApplication = useCallback(
    (
      transition: (
        application: FitnessApplication
      ) => FitnessRuleResult<FitnessApplication>
    ): FitnessRuleResult<FitnessApplication> => {
      if (!profileId) return noProfile()
      if (!state.application) {
        return { ok: false, error: "Start a Fitness application first" }
      }
      const result = transition(state.application)
      if (result.ok) save({ ...state, application: result.value })
      return result
    },
    [noProfile, profileId, save, state]
  )

  const chooseFacility = useCallback(
    (facilityId: string) =>
      updateApplication((application) => {
        const facility = findApprovedFitnessFacility(facilityId)
        return facility
          ? chooseFacilityRule(application, facility)
          : { ok: false, error: "Choose an approved facility" }
      }),
    [updateApplication]
  )

  const confirmDemoPayment = useCallback(
    () =>
      updateApplication((application) =>
        confirmDemoPaymentRule(application, state.handlers)
      ),
    [state.handlers, updateApplication]
  )
  const recordFitResult = useCallback(
    () => updateApplication(recordFitResultRule),
    [updateApplication]
  )
  const issueDemoCertificate = useCallback(
    () =>
      updateApplication((application) =>
        issueDemoCertificateRule(
          application,
          profile?.premises?.councilId ?? ""
        )
      ),
    [profile?.premises?.councilId, updateApplication]
  )

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      addHandler,
      updateHandler,
      selectHandlers,
      chooseFacility,
      confirmDemoPayment,
      recordFitResult,
      issueDemoCertificate,
    }),
    [
      addHandler,
      chooseFacility,
      confirmDemoPayment,
      isHydrated,
      issueDemoCertificate,
      recordFitResult,
      selectHandlers,
      state,
      updateHandler,
    ]
  )

  return (
    <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
  )
}

export function useFitness() {
  const value = useContext(FitnessContext)
  if (!value) {
    throw new Error("useFitness must be used within FitnessProvider")
  }
  return value
}
