import {expect} from 'chai'

export const sectionSchema = {
  id: value => expect(value).to.be.a('string').and.not.be.empty,
  name: value => expect(value).to.be.a('string').and.not.be.empty,
  order: value => expect(value).to.be.a('number'),
  date: value => expect(value).to.match(/^\d{4}-\d{2}-\d{2}$/),
}
