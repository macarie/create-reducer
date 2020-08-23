import { findMatch } from 'ksdc'

const handleDispatch = (reducers, actionKey) => (state, action) => {
  if (reducers.has(action[actionKey]) === false) {
    const keys = [...reducers.keys()].sort()
    const similarKey = findMatch(keys, action[actionKey]).bestMatch.reference

    throw new TypeError(
      `Valid actions are ${keys.join(', ')}, but ${
        action[actionKey]
      } was used; did you mean to use ${similarKey} instead?`
    )
  }

  return reducers.get(action[actionKey]).reduce(
    (newState, reducer) => ({
      ...newState,
      ...reducer(newState, action),
    }),
    state
  )
}

export default handleDispatch
