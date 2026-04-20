import supabaseServer from '../config/supabaseServer'

type NotificationPayload = {
  user_id: string
  type: string
  payload?: Record<string, unknown>
  read?: boolean
}

export async function createNotification(payload: NotificationPayload) {
  const { data, error } = await supabaseServer.from('notifications').insert(payload).select()
  if (error) throw error
  return data?.[0]
}

export async function listNotificationsForUser(userId: string) {
  const { data, error } = await supabaseServer
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabaseServer
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
  if (error) throw error
  return data?.[0]
}
