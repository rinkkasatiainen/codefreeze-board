import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'

const SESSION_URL = '/api/auth/session'
const LOGOUT_URL = '/api/auth/logout'

const testWorker = setupWorker(...[])

export function startTestWorker() {
  return testWorker
}

export function withAuthenticatedUser(isAuthenticated, userInfo = {}) {
  testWorker.use(
    http.get(SESSION_URL, () =>
      HttpResponse.json(
        { authenticated: isAuthenticated, userInfo },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      ),
    ),
  )
}

export function withLogout({ fail = false } = {}) {
  const handler = () => {
    if (fail) {
      return HttpResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
    return new HttpResponse(null, { status: 204 })
  }

  testWorker.use(
    http.get(LOGOUT_URL, handler),
    http.post(LOGOUT_URL, handler),
  )
}
