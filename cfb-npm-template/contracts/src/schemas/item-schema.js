import {expect} from 'chai'

export const itemSchema = {
  id: value => expect(value).to.be.a('string').and.not.be.empty,
  name: value => expect(value).to.be.a('string').and.not.be.empty,
  tags: value => expect(value).to.be.an('array') &&
    value.forEach(it => expect(it).to.matchSchema(tagSchema)),
}

const tagSchema = {
  name: value => expect(value).to.be.a('string'),
  type: value => expect(value).to.be.a('string'),
}

