import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useBusinessSession } from "@/app/business-session"
import {
  acknowledgeFollowUpNotice,
  acknowledgeInspectionNotice,
  escalateInspection,
  issueHealthApproval,
  issueInspectionFindings,
  recordInspectionCorrection,
  resolveInspection,
  scheduleFollowUpNotice,
  scheduleInspectionNotice,
} from "./inspection-rules"
import { createInspectionStore, emptyInspectionState } from "./inspection-store"
import type {
  InspectionCase,
  InspectionRuleResult,
  InspectionState,
} from "./inspection-types"

type CaseResult = InspectionRuleResult<InspectionCase>

interface InspectionContextValue {
  state: InspectionState
  isHydrated: boolean
  scheduleNotice: (eligible: boolean) => CaseResult
  acknowledgeNotice: () => CaseResult
  issueFindings: () => CaseResult
  recordCorrection: (findingId: string, note: string) => CaseResult
  scheduleFollowUp: () => CaseResult
  acknowledgeFollowUp: () => CaseResult
  resolveFollowUp: () => CaseResult
  escalateFollowUp: () => CaseResult
  issueApproval: () => CaseResult
  resetInspection: () => void
}

const InspectionContext = createContext<InspectionContextValue | null>(null)

export function InspectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { state: businessState, isHydrated: businessIsHydrated } =
    useBusinessSession()
  const profile = businessState.profile
  const profileId = profile?.id ?? null
  const store = useMemo(() => createInspectionStore(), [])
  const [state, setState] = useState<InspectionState>(emptyInspectionState)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (!businessIsHydrated) return
    setState(profileId ? store.read(profileId) : emptyInspectionState())
    setIsHydrated(true)
    return profileId ? store.subscribe(profileId, setState) : undefined
  }, [businessIsHydrated, profileId, store])

  const save = useCallback(
    (inspection: InspectionCase | null) => {
      const nextState = { inspection }
      if (profileId) store.write(profileId, nextState)
      setState(nextState)
    },
    [profileId, store]
  )

  const scheduleNotice = useCallback(
    (eligible: boolean): CaseResult => {
      if (!profileId)
        return { ok: false, error: "A signed-in business profile is required" }
      const result = scheduleInspectionNotice(state.inspection, eligible, {
        councilId: profile?.premises?.councilId ?? "",
        premisesName: profile?.premises?.premisesName ?? "",
      })
      if (result.ok) save(result.value)
      return result
    },
    [
      profileId,
      profile?.premises?.councilId,
      profile?.premises?.premisesName,
      save,
      state.inspection,
    ]
  )

  const updateInspection = useCallback(
    (transition: (inspection: InspectionCase) => CaseResult): CaseResult => {
      if (!profileId)
        return { ok: false, error: "A signed-in business profile is required" }
      if (!state.inspection)
        return { ok: false, error: "Schedule an inspection notice first" }
      const result = transition(state.inspection)
      if (result.ok) save(result.value)
      return result
    },
    [profileId, save, state.inspection]
  )

  const acknowledgeNotice = useCallback(
    () => updateInspection(acknowledgeInspectionNotice),
    [updateInspection]
  )
  const issueFindings = useCallback(
    () => updateInspection(issueInspectionFindings),
    [updateInspection]
  )
  const recordCorrection = useCallback(
    (findingId: string, note: string) =>
      updateInspection((inspection) =>
        recordInspectionCorrection(inspection, findingId, note)
      ),
    [updateInspection]
  )
  const scheduleFollowUp = useCallback(
    () => updateInspection(scheduleFollowUpNotice),
    [updateInspection]
  )
  const acknowledgeFollowUp = useCallback(
    () => updateInspection(acknowledgeFollowUpNotice),
    [updateInspection]
  )
  const resolveFollowUp = useCallback(
    () => updateInspection(resolveInspection),
    [updateInspection]
  )
  const escalateFollowUp = useCallback(
    () => updateInspection(escalateInspection),
    [updateInspection]
  )
  const issueApproval = useCallback(
    () => updateInspection(issueHealthApproval),
    [updateInspection]
  )
  const resetInspection = useCallback(() => save(null), [save])

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      scheduleNotice,
      acknowledgeNotice,
      issueFindings,
      recordCorrection,
      scheduleFollowUp,
      acknowledgeFollowUp,
      resolveFollowUp,
      escalateFollowUp,
      issueApproval,
      resetInspection,
    }),
    [
      state,
      isHydrated,
      scheduleNotice,
      acknowledgeNotice,
      issueFindings,
      recordCorrection,
      scheduleFollowUp,
      acknowledgeFollowUp,
      resolveFollowUp,
      escalateFollowUp,
      issueApproval,
      resetInspection,
    ]
  )

  return (
    <InspectionContext.Provider value={value}>
      {children}
    </InspectionContext.Provider>
  )
}

export function useInspection() {
  const value = useContext(InspectionContext)
  if (!value)
    throw new Error("useInspection must be used within InspectionProvider")
  return value
}
