# Scheduling capability


## TODO:

 - when adding a section that exists already, it throws error -> fix this.
```
index.js:11 [2025-05-22T15:16:15.772Z] [WARN] Error adding section 
{event: Event, section: {…}, eventId: 'codefreeze-2026'}
... {..., 'error': 'DOMException: Key already exists in the object store.' }

```
 
 - make errors somehow visible
## Schedule tests todo:
describe('adding sessions into sections. precondition: sessions are in place already', () => {
// Test list for session fetching functionality
todo('Should fetch all sessions from cfbScheduleStorage for each section')
todo('Should make as many calls as there are sections')
todo('Should add a CfbSession element into each CfbSection element for each session')
todo('Should handle empty sessions list for a section gracefully')
todo('Should handle storage errors when fetching sessions gracefully')
todo('Should update sessions when data-updated-at attribute changes')
todo('Should not update sessions when data-updated-at attribute is the same')
todo('Should sort sessions by order within each section')
todo('Should handle multiple sections with multiple sessions each')
todo('Should preserve existing section attributes when adding sessions')
})