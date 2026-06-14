# CodeFreeze Board — Weekly Frontend Challenges Plan

## Context

These challenges teach frontend fundamentals by building the CodeFreeze conference board from scratch —
starting from pure static HTML all the way to the component architecture seen in `ui/index.html`.

Each step adds one concept. The target end-state is the `cfb-schedule-orchestrator` pattern
in `ui/index.html`, where custom elements coordinate data loading and rendering of the board.

The CSS design system (Atomic Design, `cfb-` prefix) from `ui/styles.css` and its imports
is available from day one so colleagues can focus on JavaScript/HTML concepts without getting
blocked by styling.

---

## Step 0 — The Static Board *(index 0)*

**Theme**: Anatomy of the board — no JavaScript, pure HTML + CSS.

Take `ui/index-example.html` as a reference. Replace every `<cfb-*>` custom tag with
equivalent plain semantic HTML (`<div>`, `<section>`, `<article>`, `<header>`, `<footer>`)
and apply the existing `cfb-` CSS classes.

The result should look identical to the styled board, rendered with zero JavaScript.

**Learning goals**:
- Semantic HTML5 elements and their roles
- BEM-style class naming with the `cfb-` prefix
- Atomic Design layers: atoms → molecules → organisms → templates
- Understanding the visual structure before adding behaviour

**Deliverable**: A single `index.html` that visually reproduces the board
(navigation, 7-day columns, cards with tags and avatars) using only HTML and the existing `styles.css`.

---

## Challenge 1 — Your First Board Atom: `<cfb-tag>`

**Theme**: Basic Web Component — atom level.

Create a `<cfb-tag>` custom element that replaces the static `<span class="cfb-tag cfb-tag--blue">` tags in the board.

Requirements:
- Accept a `data-label` attribute for the display text
- Accept a `data-color` attribute (`red | orange | green | blue | purple | default`)
  and apply the matching CSS class variant
- Render the tag when connected to the DOM (`connectedCallback`)
- Re-render when attributes change (`attributeChangedCallback` + `observedAttributes`)

```html
<cfb-tag data-label="Keynote" data-color="blue"></cfb-tag>
```

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Use Shadow DOM to encapsulate the tag's styles
- [ ] Support a `data-count` attribute to show a number badge next to the label

**Learning goals**:
- `customElements.define()`
- `connectedCallback` lifecycle hook
- `observedAttributes` + `attributeChangedCallback`
- Mapping data attributes to CSS class variants

---

## Challenge 2 — The Session Card: Composite Component (`<cfb-session-card>`)

**Theme**: Composite / molecule-level component.

Build a `<cfb-session-card>` that composes the atoms you know:
- A card header with a title and a menu button
- A tags section that renders `<cfb-tag>` atoms (from Challenge 1) for each tag
- A footer with attendee avatars (`<div class="cfb-avatar">`)

Pass session data into the component via a `data-session` attribute (JSON string)
or via child slots.

```html
<cfb-session-card data-session='{"title":"Opening Keynote","tags":["Keynote"],"attendees":["AK","JS"]}'></cfb-session-card>
```

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Use named `<slot>` elements for title, tags and footer instead of a JSON attribute
- [ ] Support a `data-variant` attribute (`travel | default`) to apply card colour variants
- [ ] Make the menu button toggle a small dropdown with "Edit" / "Delete" options

**Learning goals**:
- Composing one custom element inside another
- Passing structured data via attributes (JSON parse/stringify)
- Light DOM slots (`<slot name="...">`)
- Separation of concerns between atoms and molecules

---

## Challenge 3 — Sorting the Column: Pub/Sub with DOM Events

**Theme**: Loose coupling through custom DOM events.

Add a sort-control icon inside `<cfb-column>`. When clicked it should fire a
`sessionsSortRequested` custom event with `{ detail: { order: 'asc' | 'desc' } }`.

The column component should listen for this event and re-order its `<cfb-session-card>` children —
**without taking a hard reference to the sort-control element**.

```js
// Sort control dispatches:
this.dispatchEvent(new CustomEvent('sessionsSortRequested', {
    bubbles: true,
    detail: { order: 'asc' }
}))

// Column subscribes:
this.addEventListener('sessionsSortRequested', (e) => { /* re-sort */ })
```

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Style the sort icon with a CSS up/down arrow that toggles on click
- [ ] Stop the event from bubbling past the column so multiple columns don't interfere
- [ ] Clean up the event listener in `disconnectedCallback` to avoid memory leaks

**Learning goals**:
- `dispatchEvent` + `CustomEvent`
- Event bubbling and `bubbles: true`
- Loose coupling: listener doesn't know the publisher's type
- Event propagation control (`stopPropagation`)
- Lifecycle cleanup in `disconnectedCallback`

---

## Challenge 4 — Load Sessions from IndexedDB

**Theme**: Client-side persistence.

Replace the hardcoded session data in your cards with data loaded from IndexedDB.

Tasks:
- Create a database `cfb-db` with an object store `sessions`
- Seed it with at least 5 conference sessions
  (fields: `id`, `title`, `day`, `room`, `tags`, `attendees`)
- Query all sessions with `getAll` and render a `<cfb-session-card>` per result

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Wrap the IndexedDB API in a small Promise-based helper class to avoid nested callbacks
- [ ] Add a `day` index and query only the sessions for a given column's day
- [ ] Use an IndexedDB cursor with a direction to implement sorted loading

**Learning goals**:
- Opening and versioning an IndexedDB database
- `IDBObjectStore` — `add`, `getAll`, cursor iteration
- `IDBIndex` for filtered/sorted queries
- Bridging async storage APIs to component rendering

---

## Challenge 5 — Add a Session: HTML Form Elements

**Theme**: HTML form elements and built-in validation.

Create a form (inside or alongside the board) to add a new conference session.
Use **only built-in HTML input elements** — no JS validation logic.

Fields:
- **Title** — text, required, min length 5
- **Day** — `<select>` with Mon–Sun options, required
- **Room** — `<select>` or `<datalist>` with room names, required
- **Session type** — radio buttons (Talk / Workshop / Keynote / Lightning Talk), required
- **Tags** — text with `<datalist>` autosuggestions (e.g. "Frontend", "Backend", "Architecture")
- **Speaker name** — text, optional
- **Start time** — time picker, required

On valid submit: persist the session to IndexedDB (from Challenge 4) and re-render the column.

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Use `FormData` to extract all field values at once instead of individual `querySelector` calls
- [ ] Group related fields into `<fieldset>` + `<legend>` blocks
- [ ] Use CSS to style required fields (asterisk) and invalid state (red border)
- [ ] Make the form responsive: labels above fields on mobile, beside fields on desktop

**Learning goals**:
- Native HTML input types (`select`, `datalist`, `radio`, `time`)
- Built-in constraint validation (`required`, `minlength`, pattern)
- `FormData` API
- `fieldset` + `legend` grouping

---

## Challenge 6 — Custom Form Element: Session Type Selector (`<cfb-session-type>`)

**Theme**: Form-associated custom elements via `ElementInternals`.

Replace the radio button group for "Session Type" from Challenge 5 with a custom
`<cfb-session-type>` element that shows clickable icon tiles for each type.

Requirements:
- Show tiles for Talk, Workshop, Keynote, Lightning Talk (use emoji or simple SVG icons)
- Visually highlight the selected tile
- The selected value must appear in the form's `FormData` when submitted
- The field must be required: the form cannot submit until a tile is selected
- Show a browser-native validation error when the user tries to submit without selecting

```html
<cfb-session-type name="session-type" required></cfb-session-type>
```

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Support the `required` attribute dynamically via `attributeChangedCallback`
- [ ] Specify a custom validation message using `setValidity`
- [ ] Use `tabIndex` and keyboard events so the component is keyboard-accessible

**Learning goals**:
- `ElementInternals` and `attachInternals()`
- `static formAssociated = true`
- `setFormValue`, `setValidity`, `reportValidity`
- Focusable elements and validation UX

---

## Challenge 7 — The Orchestrator: Flow Control Component

**Theme**: Coordinator/mediator pattern — mirrors `<cfb-schedule-orchestrator>` in `ui/index.html`.

Create a `<cfb-board-orchestrator>` wrapper element that coordinates the data flow between:
- The add-session form (`<cfb-session-form>` from Challenge 5/6)
- The day columns (the board display)

Remove any direct coupling between form and columns. Instead:
1. The form dispatches a bubbling `sessionAdded` event after persisting to IndexedDB
2. The orchestrator listens and calls `refresh()` on each affected column component
3. The column exposes a `data-refresh` attribute (or a `refresh()` method) to trigger a re-render

```html
<cfb-board-orchestrator>
    <cfb-session-form></cfb-session-form>
    <cfb-board></cfb-board>
</cfb-board-orchestrator>
```

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Add a `<cfb-session-counter>` atom that shows the total session count; refresh it on each `sessionAdded` event
- [ ] Add a `<cfb-toast>` notification component that pops up in the bottom-right corner
  for 4 seconds after a session is added
- [ ] Move DB initialisation into a `<cfb-session-loader>` component that dispatches a `sessionsLoaded` event

**Learning goals**:
- Orchestrator / mediator pattern
- Decoupled data flow without direct element references
- `attributeChangedCallback` as a refresh trigger
- Multiple subscribers on the same event

---

## Challenge 8 — SVG Timeline

**Theme**: Scalable Vector Graphics.

Visualise the conference schedule as an SVG-based **timeline grid**:
- X-axis: time slots (e.g. 09:00 – 18:00 in 30-min intervals)
- Y-axis: rooms / tracks
- Each session rendered as an SVG `<rect>` with a `<text>` label inside
- Colour rectangles by session type, matching the `cfb-tag` colour palette

Session data comes from IndexedDB (Challenge 4).

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Add a CSS legend showing session type colours
- [ ] Render the session title text inside the rectangle using SVG `<text>` with `textLength` clipping
- [ ] Use SMIL (`<animate>`) to make sessions fade in on load
- [ ] Use SMIL to highlight a session on hover (scale / colour animation)

**Learning goals**:
- SVG coordinate system, viewBox, units
- `<rect>`, `<text>`, `<line>`, `<g>` elements
- Mapping data values to pixel coordinates (proportional layout math)
- SMIL animations (`<animate>`, `<animateTransform>`)

---

## Challenge 9 — Canvas Occupancy Chart

**Theme**: HTML Canvas / 2D drawing API.

Use a `<canvas>` element to draw a **room-occupancy bar chart**:
- X-axis: time slots
- Y-axis: number of attendees
- Bars per room, colour-coded
- A horizontal line indicating maximum room capacity

Optionally overlay a line chart showing total occupancy across all rooms.

Data comes from IndexedDB session records (include an `attendees` count field).

**Constraints**: HTML, JS and CSS only. No frameworks. Max 30 minutes.

**Extras**:
- [ ] Animate the bars growing from the bottom on first render using `requestAnimationFrame`
- [ ] Add axis labels and a legend drawn with Canvas text primitives
- [ ] Switch between bar and line chart view with a toggle button
- [ ] Wrap the whole thing in a `<cfb-occupancy-chart>` custom element

**Learning goals**:
- `canvas.getContext('2d')`
- `fillRect`, `strokeRect`, `beginPath`, `moveTo`, `lineTo`, `arc`
- Drawing text with `fillText`, `measureText`
- `requestAnimationFrame` animation loop

---

## Summary Table

| Step | Custom Element(s) | Key Concept | Atomic Design Level |
|------|-------------------|-------------|---------------------|
| 0    | none | Semantic HTML + CSS | All layers (static) |
| 1    | `<cfb-tag>` | Basic Web Component | Atom |
| 2    | `<cfb-session-card>` | Composite component + slots | Molecule |
| 3    | `<cfb-sort-control>`, `<cfb-column>` | Pub/Sub (DOM events) | Molecule |
| 4    | (enhances column) | IndexedDB persistence | Molecule |
| 5    | `<cfb-session-form>` | HTML form elements | Molecule/Organism |
| 6    | `<cfb-session-type>` | Custom form element (ElementInternals) | Molecule |
| 7    | `<cfb-board-orchestrator>` | Flow control / Orchestrator | Organism |
| 8    | `<cfb-timeline>` | SVG | Organism |
| 9    | `<cfb-occupancy-chart>` | Canvas | Organism |

---

## Notes for facilitators

- The existing CSS (`ui/styles.css` and its imports) can be copied verbatim into each challenge folder —
  participants should focus on behaviour, not styling.
- Each challenge builds on the previous one; participants should keep their files across weeks.
- The "Extras" sections are intentionally open-ended — fast finishers can go deeper without
  blocking the group.
- Demo format: short screen recording or CodePen link posted in the team channel.
