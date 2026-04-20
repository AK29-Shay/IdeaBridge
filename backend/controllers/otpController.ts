/**
 * otpController.ts
 * Validates input and delegates to otpService for 2FA operations.
 */
import { sendOtpSchema, verifyOtpSchema } from '../models/schemas'
import {
  sendOtpForUser,
  verifyOtp,
  resendOtp,
  type OtpVerifyResult,
} from '../services/otpService'

export async function handleSendOtp(payload: unknown): Promise<{ otp?: string; message: string }> {
  const { user_id } = sendOtpSchema.parse(payload)
  const result = await sendOtpForUser(user_id)
  return {
    // ⚠️  Remove `otp` from this response object before going to production
    otp: result.otp,
    message: `OTP sent to registered email (valid for 5 minutes)`,
  }
}

export async function handleVerifyOtp(
  payload: unknown
): Promise<{ success: boolean; reason?: string }> {
  const { user_id, otp } = verifyOtpSchema.parse(payload)
  const result: OtpVerifyResult = await verifyOtp(user_id, otp)
  if (result.ok) return { success: true }
  return { success: false, reason: result.reason }
}

export async function handleResendOtp(
  payload: unknown
): Promise<{ otp?: string; message: string }> {
  const { user_id } = sendOtpSchema.parse(payload)
  const result = await resendOtp(user_id)
  return {
    otp: result.otp,
    message: 'A new OTP has been sent to your registered email',
  }
}
