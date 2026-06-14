import { createHash, randomBytes } from 'node:crypto'

export function generateCodeVerifier() {
  return randomBytes(32).toString('base64url')
}

export function generateCodeChallenge(verifier) {
  return createHash('sha256').update(verifier).digest('base64url')
}

export function generateState() {
  return randomBytes(16).toString('base64url')
}

export function generateSessionId() {
  return randomBytes(32).toString('base64url')
}
