import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { getSessionIdFromCookies } from './cookie-utils.js'
import { getSession, saveSession, deleteSession } from './session-store.js'
import { refreshTokens } from './cognito-oauth.js'
import { decodeIdToken } from './decode-id-token.js'

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

function cognitoConfig() {
  return {
    region: process.env.AWS_REGION || process.env.REGION || 'us-east-1',
    cognitoDomainPrefix: process.env.COGNITO_DOMAIN_PREFIX,
    clientId: process.env.USER_POOL_CLIENT_ID,
    userPoolId: process.env.USER_POOL_ID,
  }
}

function sessionExpiresAt() {
  return Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
}

async function refreshSessionTokens(session) {
  const { region, cognitoDomainPrefix, clientId } = cognitoConfig()
  const tokenResponse = await refreshTokens({
    region,
    cognitoDomainPrefix,
    clientId,
    refreshToken: session.refreshToken,
  })

  const expiresAt = Math.floor(Date.now() / 1000) + (tokenResponse.expires_in || 3600)
  const userInfo = decodeIdToken(tokenResponse.id_token)

  const updated = {
    accessToken: tokenResponse.access_token,
    idToken: tokenResponse.id_token,
    refreshToken: tokenResponse.refresh_token || session.refreshToken,
    tokenExpiresAt: expiresAt,
    userInfo: {
      username: userInfo['cognito:username'] || userInfo.preferred_username || userInfo.sub,
      email: userInfo.email,
    },
  }

  return updated
}

export async function loadSession(sessionId) {
  if (!sessionId) {
    return null
  }

  const session = await getSession(sessionId)
  if (!session) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (session.tokenExpiresAt && session.tokenExpiresAt <= now + 60) {
    try {
      const refreshed = await refreshSessionTokens(session)
      const merged = { ...session, ...refreshed }
      await saveSession(sessionId, merged, sessionExpiresAt())
      return merged
    } catch (error) {
      await deleteSession(sessionId)
      console.warn('Session refresh failed:', error.message) // eslint-disable-line no-console
      return null
    }
  }

  return session
}

export function extractSessionId(event) {
  const cookieHeader = event.headers?.Cookie || event.headers?.cookie
  return getSessionIdFromCookies(cookieHeader)
}

export async function resolveAccessTokenFromEvent(event) {
  const sessionId = extractSessionId(event)
  if (!sessionId) {
    return null
  }
  const session = await loadSession(sessionId)
  return session?.accessToken || null
}

export async function verifyAccessToken(accessToken, userPoolId) {
  if (!accessToken || !userPoolId) {
    return false
  }

  try {
    const client = new CognitoIdentityProviderClient({})
    await client.send(new GetUserCommand({ AccessToken: accessToken }))
    return true
  } catch (error) {
    console.warn('Token verification failed:', error.message) // eslint-disable-line no-console
    return false
  }
}

export { SESSION_MAX_AGE_SECONDS, sessionExpiresAt }
