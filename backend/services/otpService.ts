/**
 * otpService.ts
 * Email OTP-based 2FA: generate, send (stub), verify, and resend.
 * Uses the otp_verification table defined in the schema.
 */
import supabaseServer from '../config/supabaseServer'
import { generateOTP, otpExpiresAt, otpIsExpired } from '../utils/otp'

const MAX_ATTEMPTS = 5
const OTP_TTL_MINUTES = 5

// ─── Send / generate ──────────────────────────────────────────

/**
 * Generates a new 6-digit OTP for the given user and stores it in the DB.
 * Any existing OTP for this user is replaced (upsert on user_id).
 *
 * In production, integrate an email provider (e.g. Resend, SendGrid)
 * below the TODO comment to actually deliver the OTP.
 *
 * Returns the OTP for developer-mode flows; remove from response in production.
 */
export async function sendOtpForUser(user_id: string): Promise<{ otp: string }> {
  const otp = generateOTP(6)
  const expires_at = otpExpiresAt(OTP_TTL_MINUTES)

  const { error } = await supabaseServer
    .from('otp_verification')
    .upsert(
      { user_id, otp, expires_at, attempts: 0 },
      { onConflict: 'user_id' }
    )

  if (error) throw new Error(error.message)

  // TODO: integrate email provider here
  // await sendEmail({ to: userEmail, subject: 'Your IdeaBridge OTP', body: `Your code: ${otp}` })

  // ⚠️  Remove `otp` from the returned object in production
  return { otp }
}

// ─── Verify ───────────────────────────────────────────────────

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'too_many_attempts' | 'invalid' }

/**
 * Verifies the OTP submitted by the user.
 * - Checks attempt count (max 5)
 * - Checks expiry
 * - Increments attempts on failure
 * - Deletes the OTP record on success
 */
export async function verifyOtp(user_id: string, otp: string): Promise<OtpVerifyResult> {
  const { data, error } = await supabaseServer
    .from('otp_verification')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return { ok: false, reason: 'not_found' }
  if (data.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' }
  if (otpIsExpired(data.expires_at)) return { ok: false, reason: 'expired' }

  if (data.otp !== otp) {
    // Increment attempt counter
    await supabaseServer
      .from('otp_verification')
      .update({ attempts: data.attempts + 1 })
      .eq('user_id', user_id)
    return { ok: false, reason: 'invalid' }
  }

  // Clean up on success so OTP can't be reused
  await supabaseServer.from('otp_verification').delete().eq('user_id', user_id)
  return { ok: true }
}

// ─── Resend ───────────────────────────────────────────────────

/**
 * Resends (regenerates) an OTP for the user.
 * Simply delegates to sendOtpForUser which upserts.
 */
export async function resendOtp(user_id: string): Promise<{ otp: string }> {
  return sendOtpForUser(user_id)
}
