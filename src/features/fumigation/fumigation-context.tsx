import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useBusinessSession } from "@/app/business-session"
import { findLicensedProvider } from "./fumigation-seeds"
import {
  beginFumigationApplication,
  chooseLicensedProvider,
  confirmEho as confirmEhoRule,
  confirmFumigationPayment,
  issueFumigationCertificate,
  recordProviderReport as recordProviderReportRule,
} from "./fumigation-rules"
import { createFumigationStore, emptyFumigationState } from "./fumigation-store"
import type {
  FumigationApplication,
  FumigationRuleResult,
  FumigationState,
} from "./fumigation-types"

type ApplicationResult = FumigationRuleResult<FumigationApplication>

type FumigationContextValue = {
  state: FumigationState
  isHydrated: boolean
  startApplication: (
    requestedPeriod: string,
    declaration: boolean
  ) => ApplicationResult
  chooseProvider: (id: string) => ApplicationResult
  confirmPayment: () => ApplicationResult
  recordProviderReport: () => ApplicationResult
  confirmEho: () => ApplicationResult
  issueCertificate: () => ApplicationResult
  startRenewal: () => FumigationRuleResult<null>
}

const FumigationContext = createContext<FumigationContextValue | null>(null)

export function FumigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { state: businessState, isHydrated: businessIsHydrated } =
    useBusinessSession()
  const profile = businessState.profile
  const profileId = profile?.id ?? null
  const store = useMemo(() => createFumigationStore(), [])
  const [state, setState] = useState<FumigationState>(emptyFumigationState)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (!businessIsHydrated) return
    setState(profileId ? store.read(profileId) : emptyFumigationState())
    setIsHydrated(true)
    return profileId ? store.subscribe(profileId, setState) : undefined
  }, [businessIsHydrated, profileId, store])

  const save = useCallback(
    (nextState: FumigationState) => {
      if (profileId) store.write(profileId, nextState)
      setState(nextState)
    },
    [profileId, store]
  )

  const noProfile = useCallback(
    (): ApplicationResult => ({
      ok: false,
      error: "A signed-in business profile is required",
    }),
    []
  )

  const startApplication = useCallback(
    (requestedPeriod: string, declaration: boolean): ApplicationResult => {
      if (!profileId) return noProfile()
      const result = beginFumigationApplication(
        requestedPeriod,
        declaration,
        state.application,
        state.application?.id ??
          `fumigation-application-${(state.history?.length ?? 0) + 1}`
      )
      if (result.ok) save({ ...state, application: result.value })
      return result
    },
    [noProfile, profileId, save, state]
  )

  const updateApplication = useCallback(
    (
      transition: (application: FumigationApplication) => ApplicationResult
    ): ApplicationResult => {
      if (!profileId) return noProfile()
      if (!state.application) {
        return { ok: false, error: "Start a Fumigation application first" }
      }
      const result = transition(state.application)
      if (result.ok) save({ ...state, application: result.value })
      return result
    },
    [noProfile, profileId, save, state]
  )

  const chooseProvider = useCallback(
    (id: string) =>
      updateApplication((application) => {
        const provider = findLicensedProvider(id)
        return provider
          ? chooseLicensedProvider(application, provider)
          : { ok: false, error: "Choose a licensed provider" }
      }),
    [updateApplication]
  )

  const confirmPayment = useCallback(
    () => updateApplication(confirmFumigationPayment),
    [updateApplication]
  )
  const recordProviderReport = useCallback(
    () => updateApplication(recordProviderReportRule),
    [updateApplication]
  )
  const confirmEho = useCallback(
    () => updateApplication(confirmEhoRule),
    [updateApplication]
  )
  const issueCertificate = useCallback(
    () =>
      updateApplication((application) => {
        const result = issueFumigationCertificate(
          application,
          profile?.premises?.councilId ?? ""
        )
        if (!result.ok || !result.value.certificate || !profile?.premises)
          return result
        return {
          ok: true,
          value: {
            ...result.value,
            certificate: {
              ...result.value.certificate,
              premisesSnapshot: {
                businessName: profile.businessName,
                premisesName: profile.premises.premisesName,
                address: profile.premises.address,
              },
            },
          },
        }
      }),
    [profile, updateApplication]
  )

  const startRenewal = useCallback((): FumigationRuleResult<null> => {
    if (!profileId)
      return { ok: false, error: "A signed-in business profile is required" }
    if (state.application?.stage !== "issued" || !state.application.certificate)
      return {
        ok: false,
        error: "An issued Fumigation certificate is required before renewal",
      }
    save({
      ...state,
      history: [...(state.history ?? []), state.application],
      application: null,
    })
    return { ok: true, value: null }
  }, [profileId, save, state])

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      startApplication,
      chooseProvider,
      confirmPayment,
      recordProviderReport,
      confirmEho,
      issueCertificate,
      startRenewal,
    }),
    [
      state,
      isHydrated,
      startApplication,
      chooseProvider,
      confirmPayment,
      recordProviderReport,
      confirmEho,
      issueCertificate,
      startRenewal,
    ]
  )

  return (
    <FumigationContext.Provider value={value}>
      {children}
    </FumigationContext.Provider>
  )
}

export function useFumigation() {
  const value = useContext(FumigationContext)
  if (!value) {
    throw new Error("useFumigation must be used within FumigationProvider")
  }
  return value
}
