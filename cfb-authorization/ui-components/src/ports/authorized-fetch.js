/**
 * Fetch wrapper for same-origin /api routes using the BFF session cookie.
 * @param {string} url - Path (e.g. `/api/event/x/sections` or `/event/x/sections`)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authorizedFetch(url, options = {}) {
  const path = url.startsWith('/') ? url : `/${url}`
  const apiPath = path.startsWith('/api') ? path : `/api${path}`

  const response = await fetch(apiPath, {
    ...options,
    credentials: 'include',
  })

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('cfb-auth-failed'))
  }

  return response
}
