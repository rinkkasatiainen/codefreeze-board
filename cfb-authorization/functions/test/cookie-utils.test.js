import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getSessionIdFromCookies, parseCookies, sessionCookieHeader } from '../src/cookie-utils.js'

describe('cookie-utils', () => {
  it('parses cookies from header', () => {
    // eslint-disable-next-line camelcase
    assert.deepEqual(parseCookies('cfb_session=abc; other=1'), { cfb_session: 'abc', other: '1' })
  })

  it('extracts session id', () => {
    assert.equal(getSessionIdFromCookies('cfb_session=sid123'), 'sid123')
  })

  it('builds session cookie with HttpOnly and Secure', () => {
    const header = sessionCookieHeader('sid', 3600, true)
    assert.match(header, /cfb_session=sid/)
    assert.match(header, /HttpOnly/)
    assert.match(header, /Secure/)
    assert.match(header, /SameSite=Lax/)
  })
})
