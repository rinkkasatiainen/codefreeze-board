import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { generateCodeChallenge, generateCodeVerifier } from '../src/pkce.js'

describe('pkce', () => {
  it('generates a verifier and matching S256 challenge', () => {
    const verifier = generateCodeVerifier()
    const challenge = generateCodeChallenge(verifier)
    assert.ok(verifier.length > 40)
    assert.ok(challenge.length > 40)
    assert.notEqual(challenge, verifier)
  })
})
