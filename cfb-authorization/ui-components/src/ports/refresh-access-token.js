import authStorage from '../storage/auth-storage.js'

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken() {
  const tokens = await authStorage.getTokens()
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token available')
  }

  const config = getCognitoConfig()
  const { CognitoUserPool, CognitoUser, CognitoRefreshToken } = await import('amazon-cognito-identity-js')

  const userPool = new CognitoUserPool({
    UserPoolId: config.userPoolId,
    ClientId: config.clientId,
  })

  // Extract username from ID token or use stored user info
  const userInfo = tokens.userInfo
  if (!userInfo?.username) {
    throw new Error('No username found in stored tokens')
  }

  const cognitoUser = new CognitoUser({
    Username: userInfo.username,
    Pool: userPool,
  })

  const refreshToken = new CognitoRefreshToken({ RefreshToken: tokens.refreshToken })

  return new Promise((resolve, reject) => {
    cognitoUser.refreshSession(refreshToken, (err, session) => {
      if (err) {
        reject(err)
        return
      }

      const newTokens = {
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
        expiresAt: session.getAccessToken().getExpiration() * 1000, // Convert to milliseconds
        userInfo: tokens.userInfo, // Preserve user info
      }

      authStorage.saveTokens(newTokens).then(() => {
        resolve(newTokens.accessToken)
      }).catch(reject)
    })
  })
}

/**
 * Get Cognito configuration from window.CFB_CONFIG
 * Expected structure: { userPoolId, clientId, region, rootUrl }
 */
function getCognitoConfig() {
  if (!window.CFB_CONFIG) {
    throw new Error('CFB_CONFIG not found. Make sure Cognito config is injected at build time.')
  }
  return window.CFB_CONFIG
}
