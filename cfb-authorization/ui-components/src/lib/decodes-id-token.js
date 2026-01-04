export function decodesIdToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch (_error) { // eslint-disable-line no-unused-vars
    return {}
  }
}
