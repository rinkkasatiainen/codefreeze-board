const SESSION_COOKIE = 'cfb_session'

export function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {}
  }
  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawKey, ...rest] = part.trim().split('=')
    if (!rawKey) {
      return cookies
    }
    cookies[rawKey] = decodeURIComponent(rest.join('='))
    return cookies
  }, {})
}

export function getSessionIdFromCookies(cookieHeader) {
  const cookies = parseCookies(cookieHeader)
  return cookies[SESSION_COOKIE] || null
}

export function sessionCookieHeader(sessionId, maxAgeSeconds, secure = true) {
  const flags = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'SameSite=Lax',
  ]
  if (secure) {
    flags.push('Secure')
  }
  return flags.join('; ')
}

export function clearSessionCookieHeader(secure = true) {
  const flags = [
    `${SESSION_COOKIE}=`,
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
  ]
  if (secure) {
    flags.push('Secure')
  }
  return flags.join('; ')
}

export { SESSION_COOKIE }
