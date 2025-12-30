import {CfbSection} from '@rinkkasatiainen/cfb-session-discovery'
import {render} from './cfb-session.render'

const sampleSessions = [
  {
    name: 'Introduction to Web Components',
    tags: [{name: 'Workshop', type: 'workshop'}, {name: 'Beginner', type: 'level'}],
    speakers: [{name: 'John Doe', initials: 'JD'}, {name: 'Jane Smith', initials: 'JS'}]
  },
  {
    name: 'Advanced JavaScript Patterns',
    tags: [{name: 'Talk', type: 'talk'}, {name: 'Advanced', type: 'level'}],
    speakers: [{name: 'Alice Johnson', initials: 'AJ'}]
  },
  {
    name: 'Testing Best Practices',
    tags: [{name: 'Workshop', type: 'workshop'}, {name: 'Intermediate', type: 'level'}],
    speakers: [{name: 'Bob Wilson', initials: 'BW'}, {name: 'Carol Brown', initials: 'CB'}]
  }]

const buildHtml = args => `
  <cfb-section
    data-name="${args['data-name']}"
    data-section-id="${args['data-section-id']}"
    data-event-id="${args['data-event-id']}"
  ></cfb-section>`

export function renderSection(args) {
  return buildHtml(args)
}

export function renderSectionWithContent(args) {

  const innerHtml = sampleSessions.map(sessionInfo => {
    return render({['data-tags']: sessionInfo.tags, ['data-speakers']: sessionInfo.speakers, ['data-name']: sessionInfo.name})
  }).join('')

  setTimeout(() => {
    document.querySelector('.cfb-column').innerHTML = innerHtml
  }, 100)

  return buildHtml(args)
}
