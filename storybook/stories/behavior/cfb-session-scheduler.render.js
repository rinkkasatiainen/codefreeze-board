import {CfbSessionScheduler} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-session-scheduler'
import cfbScheduleStorage from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'

export function renderSessionScheduler(args) {
  const html = `
    <cfb-session-scheduler 
      data-event-id="${args['data-event-id']}"
      data-section-id="${args['data-section-id']}"
      data-updated-at="${args['data-updated-at']}"
    ></cfb-session-scheduler> 
  `
  return html

}

export function renderSessionSchedulerWithSection(args) {

  const documentHtml = `
  <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h3 style="margin-bottom: 20px;">Session Scheduler with Section</h3>
      <p style="margin-bottom: 20px;">
      This demo shows the Session Scheduler component within a section. 
      The scheduler fetches sessions for a specific section and displays them as session cards.<br/>
      To add new sessions, open Data -> Cfb Session Discovery -> Storage -> Session storgae demo and add sessions to the section.
      </p>
  `

  const html = `
    <cfb-session-scheduler 
        data-event-id="${args['data-event-id']}"
        data-section-id="${args['data-section-id']}"
        data-updated-at="${args['data-updated-at']}"
    > <cfb-section
      data-name="${args['data-section-name']}"
      data-section-id="${args['data-section-id']}"
      data-event-id="${args['data-event-id']}" 
      ></cfb-section>
    </cfb-session-scheduler> 
  `

  return `
  <div style="padding: 20px; font-family: Arial, sans-serif;">
  ${documentHtml}
  ${html}
  </div>
  `
}

export class renderSessionSchedulerInteractive {
}