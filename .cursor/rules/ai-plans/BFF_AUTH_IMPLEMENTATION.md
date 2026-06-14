# BFF Auth (Hosted UI + PKCE)

## Architecture

- Browser never stores Cognito JWTs; only `cfb_session` HttpOnly cookie.
- `GET /api/auth/login` → Cognito Hosted UI (PKCE).
- `GET /api/auth/callback` → token exchange, DynamoDB session, `Set-Cookie`.
- `GET /api/auth/session` → `{ authenticated, userInfo }`.
- `GET|POST /api/auth/logout` → clear session + Cognito logout.
- Business Lambdas resolve access token from session cookie via `resolveAccessTokenFromEvent`.

## Deploy notes

1. Set `domainName` in CDK context (required for OAuth callback URLs).
2. Optionally set `cognitoDomainPrefix` (defaults from domain, e.g. `cfb-rinkkasatiainen-dev`).
3. After deploy, register the Cognito hosted domain prefix if it is new (globally unique).
4. CloudFront `/api/*` forwards cookies to API Gateway.
5. Publish `@rinkkasatiainen/cfb-authorization-functions` before CI/CD if not using `file:` deps.

## UI

- `cfb-login` → `/api/auth/login`
- `authorizedFetch` → `credentials: 'include'`, paths under `/api`
- Password / NEW_PASSWORD_REQUIRED → Cognito Hosted UI
