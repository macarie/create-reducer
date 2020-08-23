const enhanceReducer = (reducers, args) =>
  reducers.map((reducer) => (state, action) =>
    reducer(state, { action, ...args })
  )

export default enhanceReducer
