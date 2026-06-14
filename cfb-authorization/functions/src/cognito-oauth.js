export function cognitoHostedBaseUrl(region, cognitoDomainPrefix) {
  return `https://${cognitoDomainPrefix}.auth.${region}.amazoncognito.com`
}

/* eslint-disable camelcase */

export function buildAuthorizeUrl({
  region,
  cognitoDomainPrefix,
  clientId,
  redirectUri,
  state,
  codeChallenge,
}) {
  const base = cognitoHostedBaseUrl(region, cognitoDomainPrefix)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `${base}/oauth2/authorize?${params.toString()}`
}

export function buildLogoutUrl({
  region,
  cognitoDomainPrefix,
  clientId,
  logoutUri,
}) {
  const base = cognitoHostedBaseUrl(region, cognitoDomainPrefix)
  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: logoutUri,
  })
  return `${base}/logout?${params.toString()}`
}

export async function exchangeAuthorizationCode({
  region,
  cognitoDomainPrefix,
  clientId,
  redirectUri,
  code,
  codeVerifier,
}) {
  const base = cognitoHostedBaseUrl(region, cognitoDomainPrefix)
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  })

  const response = await fetch(`${base}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed (${response.status}): ${text}`)
  }

  return response.json()
}

export async function refreshTokens({
  region,
  cognitoDomainPrefix,
  clientId,
  refreshToken,
}) {
  const base = cognitoHostedBaseUrl(region, cognitoDomainPrefix)
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  })

  const response = await fetch(`${base}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token refresh failed (${response.status}): ${text}`)
  }

  return response.json()
}
