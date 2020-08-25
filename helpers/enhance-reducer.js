const enhanceReducer = (reducers, args) =>
  reducers.map((reducer) =>
    args ? (state, action) => reducer(state, { action, ...args }) : reducer
  )

export default enhanceReducer
