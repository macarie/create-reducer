import getType from './get-type.js'

const deriveReducers = (reducers) => {
  const functions = []
  const aliases = []
  const composed = []

  for (const [name, reducer] of Object.entries(reducers)) {
    const typeOfReducer = typeof reducer

    if (typeOfReducer === 'function') {
      functions.push([name, reducer])
    } else if (typeOfReducer === 'string') {
      aliases.push([name, reducer])
    } else if (Array.isArray(reducer)) {
      composed.push([name, reducer])
    } else {
      throw new TypeError(
        `Supported reducer types are (function | string | array), "${name}" is ${getType(
          reducer
        )}.`
      )
    }
  }

  return {
    functions,
    aliases,
    composed,
  }
}

export default deriveReducers
