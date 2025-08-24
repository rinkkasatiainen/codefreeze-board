export function render(args) {
  const tagsHtml = args['data-tags'].map(tag =>
    `<span class="cfb-tag cfb-tag--${tag.type}">${tag.name}</span>`
  ).join('')

  const avatarsHtml = args['data-speakers'].map(speaker =>
    `<div class="cfb-avatar" aria-label="${speaker.name}">${speaker.initials}</div>`
  ).join('')
  const html = `
  <cfb-session 
     data-section-id="${args['data-section-id']}" 
     data-event-id="${args['data-event-id']}" 
     data-name="${args['data-name']}"
  >
   <article class="cfb-card cfb-card--travel" role="article">
        <header class="cfb-card__header">
          <span class="cfb-card__title">Session name</span>
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
      </article></cfb-session>`

  return html
}