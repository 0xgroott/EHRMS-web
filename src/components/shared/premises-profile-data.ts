import type {
  Premises,
  PremisesPhotoSummary,
  PremisesProfileSummary,
} from "@/domain/types"
import type { BusinessMediaItem } from "@/features/business-media/business-media-store"
import {
  businessMediaStorageKey,
  createBusinessMediaStore,
} from "@/features/business-media/business-media-store"
import { createBusinessStorage } from "@/services/business-storage"

export interface ResolvedPremisesProfile extends PremisesProfileSummary {
  businessName: string
  tradingName: string
  email?: string
  phone?: string
  address: string
  ward: string
  premisesType: string
  avatar: BusinessMediaItem | null
}

function uploadedPhotos(items: Array<BusinessMediaItem | null>) {
  return items.flatMap<PremisesPhotoSummary>((item, index) =>
    item
      ? [
          {
            id: `uploaded-photo-${index + 1}`,
            name: item.name,
            dataUrl: item.dataUrl,
          },
        ]
      : []
  )
}

export function resolvePremisesProfile(
  premises: Premises,
  storage: Storage | null = typeof window === "undefined"
    ? null
    : window.localStorage
): ResolvedPremisesProfile {
  const seeded: ResolvedPremisesProfile = {
    ...premises.profile,
    businessName: premises.businessName,
    tradingName: premises.tradingName,
    email: premises.email,
    phone: premises.phone,
    address: premises.address,
    ward: premises.ward,
    premisesType: premises.premisesType,
    avatar: null,
  }

  if (!storage || !premises.businessProfileId) return seeded

  const savedProfile = createBusinessStorage(storage).read().profile
  if (!savedProfile || savedProfile.id !== premises.businessProfileId) {
    return seeded
  }

  const media = createBusinessMediaStore(storage).read(savedProfile.id)
  const hasSavedMedia = storage.getItem(
    businessMediaStorageKey(savedProfile.id)
  )
  const savedPremises = savedProfile.premises

  return {
    businessName: savedProfile.businessName,
    tradingName: savedPremises?.premisesName ?? seeded.tradingName,
    contactName: savedProfile.contactName,
    premisesName: savedPremises?.premisesName ?? seeded.premisesName,
    registrationNumber:
      savedPremises?.registrationNumber ?? seeded.registrationNumber,
    email: savedProfile.email,
    phone: savedProfile.phone,
    address: savedPremises?.address ?? seeded.address,
    ward: savedPremises?.ward ?? seeded.ward,
    premisesType: savedPremises?.businessType ?? seeded.premisesType,
    links: savedProfile.links ?? seeded.links,
    avatar: media.avatar,
    photos: hasSavedMedia ? uploadedPhotos(media.photos) : seeded.photos,
  }
}
