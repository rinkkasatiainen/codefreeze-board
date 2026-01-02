import authStorage from '../storage/auth-storage.js'
import { refreshAccessToken } from './refresh-access-token.js'

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

/**
 * Get the root URL for API requests
 */
function getRootUrl() {
  const config = getCognitoConfig()
  return config.rootUrl || 'https://cfb.rinkkasatiainen.dev'
}

/**
 * Authorized fetch wrapper that adds Authorization header and handles token refresh on 401
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function authorizedFetch(url, options = {}) {
  // Get access token
  let accessToken = await authStorage.getAccessToken()
  const root = getRootUrl()

  // Prepare headers
  const headers = new Headers(options.headers || {})
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  // Make initial request
  let response = await fetch(`${root}${url}`, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - try to refresh token and retry once
  if (response.status === 401 && accessToken) {
    try {
      // Try to refresh the token
      accessToken = await refreshAccessToken()

      // Update Authorization header with new token
      headers.set('Authorization', `Bearer ${accessToken}`)

      // Retry the request with new token (fix: include root URL prefix)
      response = await fetch(`${root}${url}`, {
        ...options,
        headers,
      })
    } catch (_refreshError) { // eslint-disable-line no-unused-vars
      // Refresh failed - clear tokens and return original 401 response
      await authStorage.clearTokens()
      // Dispatch event to notify app of authentication failure
      window.dispatchEvent(new CustomEvent('cfb-auth-failed'))
      return response
    }
  }

  return response
}

