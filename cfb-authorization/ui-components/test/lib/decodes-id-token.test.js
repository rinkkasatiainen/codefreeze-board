import { expect } from 'chai'

// eslint-disable-next-line import/extensions
import { decodesIdToken } from '../../src/lib/decodes-id-token'

describe('decodesIdToken', () => {
  it('decodes token succesfully', () => {
    const payload = btoa(JSON.stringify({
      'sub': 'sub.testuser',
      'cognito:username': 'testuser',
      'email': 'test@example.com',
    }))
    const exampleToken = `header.${payload}.signature`

    const userInfo = decodesIdToken(exampleToken)

    expect(userInfo['cognito:username']).to.eql('testuser')
    expect(userInfo.sub).to.eql('sub.testuser')
    expect(userInfo.email).to.eql('test@example.com')
  })
})
