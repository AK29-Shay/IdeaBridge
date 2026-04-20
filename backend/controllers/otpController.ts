import { sendOtpForUser, verifyOtp } from '../services/otpService'

export async function sendOtp(user_id: string) {
  return sendOtpForUser(user_id)
}

export async function verifyUserOtp(user_id: string, otp: string) {
  return verifyOtp(user_id, otp)
}
