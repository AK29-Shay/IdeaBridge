import { createNotification, markNotificationRead } from '../services/notificationService'

type NotificationInput = {
  user_id: string
  type: string
  payload?: Record<string, unknown>
  read?: boolean
}

export async function notify(payload: NotificationInput) {
  return createNotification(payload)
}

export async function readNotification(id: string) {
  return markNotificationRead(id)
}
