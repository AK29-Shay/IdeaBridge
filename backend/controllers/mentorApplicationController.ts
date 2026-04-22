import { mentorApplicationSchema } from '../models/schemas'
import { createMentorApplication, setApplicationStatus } from '../services/mentorApplicationService'

export async function submitApplication(payload: unknown) {
  const parsed = mentorApplicationSchema.parse(payload)
  return createMentorApplication(parsed)
}

export async function approveApplication(application_id: string) {
  return setApplicationStatus(application_id, 'approved')
}

export async function rejectApplication(application_id: string) {
  return setApplicationStatus(application_id, 'rejected')
}