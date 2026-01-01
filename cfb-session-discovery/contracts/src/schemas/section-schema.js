import { expect } from 'chai'

export const sectionSchema = {
  id: value => expect(value).to.be.a('string').and.not.be.empty,
  name: value => expect(value).to.be.a('string').and.not.be.empty,
  order: value => expect(value).to.be.a('number'),
  date: value => expect(value).to.match(/^\d{4}-\d{2}-\d{2}$/),
}

export const sessionSchema = {
  id: value => expect(value).to.be.a('string').and.not.be.empty,
  sectionId: value => expect(value).to.be.a('string').and.not.be.empty,
  name: value => expect(value).to.be.a('string').and.not.be.empty,
  order: value => expect(value).to.be.a('number'),
  description: value => expect(value).to.be.a('string'),
  tags: value => expect(value).to.be.an('array') &&
    value.forEach(it => expect(it).to.matchSchema(tagSchema)),
  speakers: value => expect(value).to.be.an('array') &&
    value.forEach( it => expect(it).to.matchSchema(speakerSchema)),
}

const tagSchema = {
  name: value => expect(value).to.be.a('string'),
  type: value => expect(value).to.be.a('string'),
}

const speakerSchema = {
  name: value => expect(value).to.be.a('string'),
  initials: value => expect(value).to.be.a('string'),
}
