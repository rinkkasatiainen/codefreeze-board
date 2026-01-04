import {expect} from 'chai'

export const tokenSchema = {
  accessToken: value => expect(value).to.be.a('string').and.not.be.empty,
  idToken: value => expect(value).to.be.a('string').and.not.be.empty,
  expiresAt: value => expect(value).to.be.a('number'),
  refreshToken: value => expect(value).to.be.a('string').and.not.be.empty,
  userInfo: value => expect(value).to.matchSchema(UserInfoSchema)
}

const UserInfoSchema = {
  username: value => expect(value).to.be.a('string'),
  email: value => expect(value).to.be.a('string'),
}

