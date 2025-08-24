import {CfbSection} from '@rinkkasatiainen/cfb-session-discovery'


const buildHtml = args => `
  <cfb-section
    data-name="${args['data-name']}"
    data-section-id="${args['data-section-id']}"
    data-event-id="${args['data-event-id']}"
  ></cfb-section>
      `

export function renderSection(args) {
  return buildHtml(args)

  // const element = document.createElement(CfbSection.elementName)
  //
  // if (args['data-name']) {
  //   element.setAttribute('data-name', args['data-name'])
  // }
  // if (args['data-section-id']) {
  //   element.setAttribute('data-section-id', args['data-section-id'])
  // }
  // if (args['data-event-id']) {
  //   element.setAttribute('data-event-id', args['data-event-id'])
  // }
  //
  // return element
}

export function renderSectionWithContent(args) {
  const sampleSessions = [
    {
      name: 'Introduction to Web Components',
      tags: [{ name: 'Workshop', type: 'workshop' }, { name: 'Beginner', type: 'level' }],
      speakers: [{ name: 'John Doe', initial: 'JD' }, { name: 'Jane Smith', initial: 'JS' }]
    },
    {
      name: 'Advanced JavaScript Patterns',
      tags: [{ name: 'Talk', type: 'talk' }, { name: 'Advanced', type: 'level' }],
      speakers: [{ name: 'Alice Johnson', initial: 'AJ' }]
    },
    {
      name: 'Testing Best Practices',
      tags: [{ name: 'Workshop', type: 'workshop' }, { name: 'Intermediate', type: 'level' }],
      speakers: [{ name: 'Bob Wilson', initial: 'BW' }, { name: 'Carol Brown', initial: 'CB' }]
    }]

  const innerHtml = sampleSessions.map(session => {
    const sessionElement = document.createElement('cfb-session')
    sessionElement.setAttribute('data-session-id', `session-${Math.random().toString(36).substr(2, 9)}`)

    const tagsHtml = session.tags.map(tag =>
      `<span class="cfb-tag cfb-tag--${tag.type}">${tag.name}</span>`
    ).join('')

    const avatarsHtml = session.speakers.map(speaker =>
      `<div class="cfb-avatar" aria-label="${speaker.name}">${speaker.initial}</div>`
    ).join('')

    sessionElement.innerHTML = `
          <article class="cfb-card cfb-card--travel" role="article">
            <header class="cfb-card__header">
              <span class="cfb-card__title">${session.name}</span>
              <button class="cfb-card__menu" aria-label="Card options">
                <span class="cfb-card__menu-icon"></span>
              </button>
            </header>
            <div class="cfb-card__tags">
              ${tagsHtml}
            </div>
            <footer class="cfb-card__footer">
              <div class="cfb-avatars" aria-label="Attending team members">
                ${avatarsHtml}
              </div>
            </footer>
          </article>
        `

    return sessionElement.outerHTML
  })

  const html = `
  <cfb-section>
    <cfb-column-title>
      <h2 class="cfb-column__title">${name}</h2>
    </cfb-column-title>
    <section class="cfb-column" role="region" aria-label="${name} column">
      ${innerHtml.join('')}
    </section>
  </cfb-section>
  `
  return html
}

export function renderSectionInteractive(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'

  const title = document.createElement('h3')
  title.textContent = 'Interactive Section Component'
  title.style.marginBottom = '20px'

  const description = document.createElement('p')
  description.textContent = 'This demo shows the Section component with interactive controls. You can change the section name and see the component update in real-time.'
  description.style.marginBottom = '20px'

  const controls = document.createElement('div')
  controls.style.marginBottom = '20px'

  const nameLabel = document.createElement('label')
  nameLabel.textContent = 'Section Name: '
  nameLabel.style.marginRight = '10px'

  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.value = args['data-name'] || 'Interactive Section'
  nameInput.style.padding = '8px'
  nameInput.style.marginRight = '20px'
  nameInput.style.width = '200px'

  const sectionIdLabel = document.createElement('label')
  sectionIdLabel.textContent = 'Section ID: '
  sectionIdLabel.style.marginRight = '10px'

  const sectionIdInput = document.createElement('input')
  sectionIdInput.type = 'text'
  sectionIdInput.value = args['data-section-id'] || 'section-1'
  sectionIdInput.style.padding = '8px'
  sectionIdInput.style.width = '150px'

  const element = document.createElement(CfbSection.elementName)
  element.setAttribute('data-name', nameInput.value)
  element.setAttribute('data-section-id', sectionIdInput.value)
  element.setAttribute('data-event-id', args['data-event-id'] || 'demo-event-123')

  // Update component when inputs change
  nameInput.addEventListener('input', (e) => {
    element.setAttribute('data-name', e.target.value)
  })

  sectionIdInput.addEventListener('input', (e) => {
    element.setAttribute('data-section-id', e.target.value)
  })

  controls.appendChild(nameLabel)
  controls.appendChild(nameInput)
  controls.appendChild(sectionIdLabel)
  controls.appendChild(sectionIdInput)

  container.appendChild(title)
  container.appendChild(description)
  container.appendChild(controls)
  container.appendChild(element)

  return container
}
