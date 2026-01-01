import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'

/**
 * Verify Cognito access token and return authorization status
 * @param {string} accessToken - The access token to verify
 * @param {string} userPoolId - The Cognito User Pool ID
 * @returns {Promise<boolean>} - True if token is valid, false otherwise
 */
export async function verifyAccessToken(accessToken, userPoolId) {
  if (!accessToken || !userPoolId) {
    return false
  }

  try {
    const client = new CognitoIdentityProviderClient({})
    const command = new GetUserCommand({
      AccessToken: accessToken,
    })

    await client.send(command)
    return true
  } catch (error) {
    // Token is invalid or expired
    // eslint-disable-next-line no-console
    console.warn('Token verification failed:', error.message)
    return false
  }
}

/**
 * Extract access token from Authorization header
 * @param {Object} event - API Gateway event
 * @returns {string|null} - The access token or null if not found
 */
export function extractAccessToken(event) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization
  if (!authHeader) {
    return null
  }

  // Extract token from "Bearer <token>" format
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

