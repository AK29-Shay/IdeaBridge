import supabaseServer from '../config/supabaseServer'
import { generateOTP, otpExpiresAt } from '../utils/otp'

export async function sendOtpForUser(user_id: string) {
  const otp = generateOTP(6)
  const expires_at = otpExpiresAt(5)

  const payload = { user_id, otp, expires_at, attempts: 0 }
  const { data, error } = await supabaseServer.from('otps').upsert(payload, { onConflict: 'user_id' }).select()
  if (error) throw error

  // TODO: integrate real SMS/email provider. For now return OTP for developer flows.
  return { otp, record: data?.[0] }
}

export async function verifyOtp(user_id: string, otp: string) {
  const { data, error } = await supabaseServer.from('otps').select('*').eq('user_id', user_id).maybeSingle()
  if (error) throw error
  if (!data) return { ok: false, reason: 'not_found' }
  if (data.attempts >= 5) return { ok: false, reason: 'too_many_attempts' }
  if (new Date(data.expires_at).getTime() < Date.now()) return { ok: false, reason: 'expired' }
  if (data.otp !== otp) {
    await supabaseServer.from('otps').update({ attempts: data.attempts + 1 }).eq('user_id', user_id)
    return { ok: false, reason: 'invalid' }
  }

  // success - remove otp record
  await supabaseServer.from('otps').delete().eq('user_id', user_id)
  return { ok: true }
}
