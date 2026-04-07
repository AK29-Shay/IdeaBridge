import { requestSchema } from '../models/schemas'
import { createRequest, updateRequestStatus } from '../services/requestService'

export async function submitRequest(payload: any) {
  const parsed = requestSchema.parse(payload)
  return createRequest(parsed)
}

export async function changeRequestStatus(request_id: string, status: string, actorId?: string) {
  // basic validation of transitions could be added here
  return updateRequestStatus(request_id, status, actorId)
}
