// =============================================================================
// InputLogger Entity Module - Pure Functions with Immutability
// =============================================================================

export const InputLogger = {
  // Initial state factory
  empty: () => ({
    lastInput: null,
    inputCount: 0,
  }),

  // Event handlers (reducers): (state, event) => newState
  eventHandlers: {
    'input-logged': (state, event) => ({
      ...state,
      lastInput: event.detail.data.value,
      inputCount: state.inputCount + 1,
    }),
  },

  apply: (state, evt) => InputLogger.eventHandlers[evt.detail.metadata.type](state, evt),

  // Domain queries - pure functions
  hasInput: state => state.lastInput !== null,

  // Domain commands - return events (not state changes)
  // Pure function: (state, input) => events[]
  //
  // Returns only { type, data } - the stream adds metadata:
  //   { detail: { metadata: { id, version, timestamp, capability, type }, data } }
  logInput: (_state, input) => [
    {
      type: 'input-logged',
      data: {value: input},
    },
  ],
}
