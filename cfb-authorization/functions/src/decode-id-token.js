export function decodeIdToken(idToken) {
  if (!idToken) {
    return {}
  }
  const payload = idToken.split('.')[1]
  const json = Buffer.from(payload, 'base64url').toString('utf8')
  return JSON.parse(json)
}
