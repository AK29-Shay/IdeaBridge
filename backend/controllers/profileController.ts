import { upsertProfile, getProfileByUserId } from '../services/profileService'
import { profileSchema } from '../models/schemas'

export async function createOrUpdateProfile(payload: unknown) {
  const parsed = profileSchema.parse(payload)
  return upsertProfile(parsed)
}

export async function fetchProfile(user_id: string) {
  return getProfileByUserId(user_id)
}
