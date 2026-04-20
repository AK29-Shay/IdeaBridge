import { addRating } from '../services/ratingService'
import { ratingSchema } from '../models/schemas'

export async function submitRating(payload: unknown) {
  const parsed = ratingSchema.parse(payload)
  return addRating(parsed)
}
