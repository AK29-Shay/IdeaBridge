/**
 * otp.ts
 * Utility helpers for OTP generation and expiry.
 */
import { randomInt } from 'crypto'

/** Generates a cryptographically random numeric OTP of the given length */
export function generateOTP(length = 6): string {
  const max = Math.pow(10, length)
  const code = randomInt(0, max)
  return code.toString().padStart(length, '0')
}

/** Returns an ISO timestamp string `minutes` minutes in the future */
export function otpExpiresAt(minutes = 5): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

/** Checks whether an OTP has expired */
export function otpIsExpired(expiresAtIso: string): boolean {
  return new Date(expiresAtIso).getTime() < Date.now()
}
