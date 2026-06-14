import {
  buildAuthorizeUrl,
  buildLogoutUrl,
  exchangeAuthorizationCode,
} from './cognito-oauth.js'
import { generateCodeChallenge, generateCodeVerifier, generateSessionId, generateState } from './pkce.js'
import {
  clearSessionCookieHeader,
  getSessionIdFromCookies,
  sessionCookieHeader,
} from './cookie-utils.js'
import { consumePkceState, deleteSession, savePkceState, saveSession } from './session-store.js'
import { decodeIdToken } from './decode-id-token.js'
import { loadSession, SESSION_MAX_AGE_SECONDS, sessionExpiresAt } from './session-auth.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Cookie',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

function isSecureRequest(event) {
  const proto = event.headers?.['X-Forwarded-Proto'] || event.headers?.['x-forwarded-proto']
  return proto === 'https' || process.env.ALLOW_INSECURE_COOKIES !== 'true'
}

function redirect(location, extraHeaders = {}) {
  return {
    statusCode: 302,
    headers: {
      Location: location,
      ...extraHeaders,
    },
    body: '',
  }
}

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  }
}

function sanitizeReturnTo(returnTo) {
  if (!returnTo || typeof returnTo !== 'string') {
    return '/index.html'
  }
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return '/index.html'
  }
  return returnTo
}

function appBaseUrl() {
  return process.env.APP_BASE_URL || 'https://cfb.rinkkasatiainen.dev'
}

function callbackUrl() {
  return `${appBaseUrl()}/api/auth/callback`
}

function cognitoEnv() {
  return {
    region: process.env.AWS_REGION || process.env.REGION || 'us-east-1',
    cognitoDomainPrefix: process.env.COGNITO_DOMAIN_PREFIX,
    clientId: process.env.USER_POOL_CLIENT_ID,
  }
}

async function handleLogin(event) {
  const params = event.queryStringParameters || {}
  const returnTo = sanitizeReturnTo(params.returnTo)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const pkceExpiresAt = Math.floor(Date.now() / 1000) + 600

  await savePkceState(state, { codeVerifier, returnTo, expiresAt: pkceExpiresAt })

  const { region, cognitoDomainPrefix, clientId } = cognitoEnv()
  const authorizeUrl = buildAuthorizeUrl({
    region,
    cognitoDomainPrefix,
    clientId,
    redirectUri: callbackUrl(),
    state,
    codeChallenge,
  })

  return redirect(authorizeUrl)
}

async function handleCallback(event) {
  const params = event.queryStringParameters || {}
  const { code, state, error, error_description: errorDescription } = params

  if (error) {
    const message = encodeURIComponent(errorDescription || error)
    return redirect(`${appBaseUrl()}/login.html?error=${message}`)
  }

  if (!code || !state) {
    return redirect(`${appBaseUrl()}/login.html?error=missing_code_or_state`)
  }

  const pkce = await consumePkceState(state)
  if (!pkce) {
    return redirect(`${appBaseUrl()}/login.html?error=invalid_or_expired_state`)
  }

  const { region, cognitoDomainPrefix, clientId } = cognitoEnv()
  const tokens = await exchangeAuthorizationCode({
    region,
    cognitoDomainPrefix,
    clientId,
    redirectUri: callbackUrl(),
    code,
    codeVerifier: pkce.codeVerifier,
  })

  const userInfo = decodeIdToken(tokens.id_token)
  const sessionId = generateSessionId()
  const tokenExpiresAt = Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600)
  const secure = isSecureRequest(event)

  await saveSession(sessionId, {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt,
    userInfo: {
      username: userInfo['cognito:username'] || userInfo.preferred_username || userInfo.sub,
      email: userInfo.email,
    },
  }, sessionExpiresAt())

  const returnTo = sanitizeReturnTo(pkce.returnTo)
  return redirect(`${appBaseUrl()}${returnTo}`, {
    'Set-Cookie': sessionCookieHeader(sessionId, SESSION_MAX_AGE_SECONDS, secure),
  })
}

async function handleLogout(event) {
  const cookieHeader = event.headers?.Cookie || event.headers?.cookie
  const sessionId = getSessionIdFromCookies(cookieHeader)
  if (sessionId) {
    await deleteSession(sessionId)
  }

  const secure = isSecureRequest(event)
  const { region, cognitoDomainPrefix, clientId } = cognitoEnv()
  const cognitoLogout = buildLogoutUrl({
    region,
    cognitoDomainPrefix,
    clientId,
    logoutUri: `${appBaseUrl()}/login.html`,
  })

  return redirect(cognitoLogout, {
    'Set-Cookie': clearSessionCookieHeader(secure),
  })
}

async function handleSession(event) {
  const cookieHeader = event.headers?.Cookie || event.headers?.cookie
  const sessionId = getSessionIdFromCookies(cookieHeader)
  const session = await loadSession(sessionId)

  if (!session?.userInfo) {
    return jsonResponse(200, { authenticated: false })
  }

  return jsonResponse(200, {
    authenticated: true,
    userInfo: session.userInfo,
  })
}

function routePath(event) {
  const raw = event.path || event.requestContext?.path || ''
  return raw.replace(/\/$/, '')
}

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: CORS_HEADERS, body: '' }
    }

    const path = routePath(event)

    if (path.endsWith('/api/auth/login') && event.httpMethod === 'GET') {
      return handleLogin(event)
    }
    if (path.endsWith('/api/auth/callback') && event.httpMethod === 'GET') {
      return handleCallback(event)
    }
    if (path.endsWith('/api/auth/logout') && (event.httpMethod === 'GET' || event.httpMethod === 'POST')) {
      return handleLogout(event)
    }
    if (path.endsWith('/api/auth/session') && event.httpMethod === 'GET') {
      return handleSession(event)
    }

    return jsonResponse(404, { error: 'Not found', path })
  } catch (error) {
    console.error('Auth handler error:', error) // eslint-disable-line no-console
    return jsonResponse(500, { error: 'Internal server error', message: error.message })
  }
}
