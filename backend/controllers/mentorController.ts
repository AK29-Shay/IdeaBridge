import { searchMentorsBySkill } from '../services/profileService'

export async function searchMentors(query: { skill?: string }) {
  if (!query.skill) return []
  return searchMentorsBySkill(query.skill)
}
