/**
 * notificationService.ts
 * Event-driven notifications — create, read, and mark-as-read.
 */
import supabaseServer from '../config/supabaseServer'
import type { DbNotification, NotificationType } from '../models/types'

// ─── Create ───────────────────────────────────────────────────

export interface CreateNotificationPayload {
  user_id: string
  type:    NotificationType | string
  title?:  string
  message?: string
  payload?: Record<string, unknown>
}

export async function createNotification(
  input: CreateNotificationPayload
): Promise<DbNotification> {
  const { data, error } = await supabaseServer
    .from('notifications')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Convenience factories ────────────────────────────────────

/** Notifies a student that their request was accepted */
export async function notifyRequestAccepted(
  student_id: string,
  request_id: string,
  mentorName: string
) {
  return createNotification({
    user_id: student_id,
    type:    'request_accepted',
    title:   'Request Accepted',
    message: `${mentorName} has accepted your help request.`,
    payload: { request_id },
  })
}

/** Notifies a student that their request was rejected */
export async function notifyRequestRejected(
  student_id: string,
  request_id: string,
  mentorName: string
) {
  return createNotification({
    user_id: student_id,
    type:    'request_rejected',
    title:   'Request Rejected',
    message: `${mentorName} is unable to take your request at this time.`,
    payload: { request_id },
  })
}

/** Notifies a student of any status change on their request */
export async function notifyStatusUpdated(
  student_id: string,
  request_id: string,
  newStatus: string
) {
  return createNotification({
    user_id: student_id,
    type:    'request_status_updated',
    title:   'Request Updated',
    message: `Your request status has been updated to: ${newStatus}.`,
    payload: { request_id, status: newStatus },
  })
}

/** Notifies a mentor that they received a new rating */
export async function notifyNewRating(mentor_id: string, rating: number, reviewerName: string) {
  return createNotification({
    user_id: mentor_id,
    type:    'new_rating',
    title:   'New Rating Received',
    message: `${reviewerName} rated you ${rating}/5.`,
    payload: { rating },
  })
}

// ─── Read ─────────────────────────────────────────────────────

/** All notifications for a user, newest first */
export async function getNotificationsByUser(user_id: string): Promise<DbNotification[]> {
  const { data, error } = await supabaseServer
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Update ───────────────────────────────────────────────────

/** Mark one notification as read */
export async function markNotificationRead(
  notification_id: string,
  user_id: string
): Promise<DbNotification> {
  const { data, error } = await supabaseServer
    .from('notifications')
    .update({ read: true })
    .eq('id', notification_id)
    .eq('user_id', user_id) // ownership check
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/** Mark all unread notifications for this user as read */
export async function markAllNotificationsRead(user_id: string): Promise<void> {
  const { error } = await supabaseServer
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user_id)
    .eq('read', false)

  if (error) throw new Error(error.message)
}
