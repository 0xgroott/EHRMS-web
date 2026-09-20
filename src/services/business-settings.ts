export interface BusinessSettings {
  applicationEmails: boolean
  inspectionEmails: boolean
}

const defaults: BusinessSettings = {
  applicationEmails: false,
  inspectionEmails: false,
}

function key(businessId: string) {
  return `ehrcms:business-settings:v1:${businessId}`
}

export function readBusinessSettings(
  businessId: string,
  storage: Storage = window.localStorage
): BusinessSettings {
  try {
    const saved: unknown = JSON.parse(
      storage.getItem(key(businessId)) ?? "null"
    )
    if (
      saved &&
      typeof saved === "object" &&
      "applicationEmails" in saved &&
      typeof saved.applicationEmails === "boolean" &&
      "inspectionEmails" in saved &&
      typeof saved.inspectionEmails === "boolean"
    ) {
      return {
        applicationEmails: saved.applicationEmails,
        inspectionEmails: saved.inspectionEmails,
      }
    }
  } catch {
    // Invalid browser data uses safe defaults.
  }
  return { ...defaults }
}

export function saveBusinessSettings(
  businessId: string,
  settings: BusinessSettings,
  storage: Storage = window.localStorage
) {
  storage.setItem(key(businessId), JSON.stringify(settings))
}
