const objectRegExp = /^\[object (.*?)]$/
const getObjectType = (object) =>
  Object.prototype.toString.call(object).replace(objectRegExp, '$1')

const getReducersByType = (reducerObject) => {
  const functions = []
  const aliases = []
  const composed = []

  for (const [key, value] of Object.entries(reducerObject)) {
    const typeOfValue = typeof value

    if (typeOfValue === 'function') {
      functions.push([key, value])
    } else if (typeOfValue === 'string') {
      aliases.push([key, value])
    } else if (Array.isArray(value)) {
      composed.push([key, value])
    } else {
      throw new TypeError(
        `The reducer associated with "${key}" is of type ${getObjectType(
          value
        )}, this type is not supported.`
      )
    }
  }

  return {
    functions,
    aliases,
    composed,
  }
}

const setReducersFunctions = (functions, reducers) => {
  for (const [key, reducer] of functions) {
    reducers.set(key, [reducer])
  }
}

const argumentsRegExp = /\(({[\s\S]*?})\)/
const getNormalizedAlias = (alias) => {
  const cleanAlias = alias.replace(argumentsRegExp, '').trim()
  const aliasArguments = alias.match(argumentsRegExp)

  return {
    cleanAlias,
    aliasArguments: aliasArguments && JSON.parse(aliasArguments[1]),
  }
}

const getReducerWithArguments = (reducers, key, args) => {
  const reducerArray = reducers.get(key)

  if (args) {
    return reducerArray.map((reducer) => (state, action) =>
      reducer(state, { action, ...args })
    )
  }

  return reducerArray
}

const setReducersAliases = (aliases, reducers, missing) => {
  for (const [key, alias] of aliases) {
    const { cleanAlias, aliasArguments } = getNormalizedAlias(alias)

    if (reducers.has(cleanAlias)) {
      reducers.set(
        key,
        getReducerWithArguments(reducers, cleanAlias, aliasArguments)
      )
    } else {
      missing.push([key, alias])
    }
  }
}

const setComposedReducers = (composed, reducers, missing) => {
  for (const [key, reducerParts] of composed) {
    reducers.set(key, [])

    for (const reducer of reducerParts) {
      const composedReducers = reducers.get(key)
      const typeOfReducer = typeof reducer

      if (typeOfReducer === 'string') {
        const { cleanAlias, aliasArguments } = getNormalizedAlias(reducer)

        if (reducers.has(cleanAlias)) {
          reducers.set(key, [
            ...composedReducers,
            ...getReducerWithArguments(reducers, cleanAlias, aliasArguments),
          ])
        } else {
          reducers.set(key, [...composedReducers, reducer])

          missing.push([key, reducer])
        }
      } else if (typeOfReducer === 'function') {
        reducers.set(key, [...composedReducers, reducer])
      } else {
        throw new TypeError(
          `One of the reducers associated with "${key}" is of type ${getObjectType(
            reducer
          )}, this type is not supported.`
        )
      }
    }
  }
}

const createMissingString = (missing) =>
  missing
    .map(
      (missingPair) =>
        `(${missingPair.map((value) => `'${value}'`).join(' => ')})`
    )
    .join(', ')

const guardAgainstAliasCycles = (missing) => {
  const startingIndex = missing.length - 1

  for (let index = startingIndex; index >= 0; index -= 1) {
    for (let nestedIndex = index; nestedIndex >= 0; nestedIndex -= 1) {
      if (
        missing[index][0] === missing[nestedIndex][1] &&
        missing[index][1] === missing[nestedIndex][0]
      ) {
        throw new TypeError(
          `Found an infinite cycle of aliases, the (key => value) pairs are: ${createMissingString(
            [missing[index], missing[nestedIndex]]
          )}.`
        )
      }
    }
  }
}

const setMissedReducersAliases = (missing, reducers) => {
  const startingIndex = missing.length - 1

  for (let index = startingIndex; index >= 0; index -= 1) {
    const [key, alias] = missing[index]

    const { cleanAlias, aliasArguments } = getNormalizedAlias(alias)

    if (reducers.has(cleanAlias)) {
      reducers.set(
        key,
        getReducerWithArguments(reducers, cleanAlias, aliasArguments)
      )

      missing.splice(index, 1)
    }
  }
}

const setMissedComposedReducers = (missing, reducers) => {
  const startingIndex = missing.length - 1

  for (let index = startingIndex; index >= 0; index -= 1) {
    const [key, alias] = missing[index]

    const { cleanAlias, aliasArguments } = getNormalizedAlias(alias)

    if (reducers.has(key) && reducers.has(cleanAlias)) {
      const composedReducers = reducers.get(key)
      const aliasIndex = composedReducers.findIndex(
        (reducer) => reducer === alias
      )

      composedReducers.splice(
        aliasIndex,
        1,
        ...getReducerWithArguments(reducers, cleanAlias, aliasArguments)
      )

      reducers.set(key, composedReducers)

      missing.splice(index, 1)
    }
  }
}

const guardAgainstMissingAliases = (missing) => {
  if (missing.length > 0) {
    throw new TypeError(
      `It wasn't possible to locate some aliases, the missing (key => value) pairs are: ${createMissingString(
        missing
      )}.`
    )
  }
}

const handleDispatch = (reducers, actionKey) => (state, action) => {
  if (reducers.has(action[actionKey]) === false) {
    throw new TypeError(
      `Expected action ${JSON.stringify(actionKey)} to be one of ${[
        ...reducers.keys(),
      ]
        .sort()
        .join(', ')}, but it's ${action[actionKey]}.`
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

export const composableReducer = (
  reducerObject,
  { actionKey = 'type' } = {}
) => {
  const reducerMap = new Map()

  const { functions, aliases, composed } = getReducersByType(reducerObject)

  setReducersFunctions(functions, reducerMap)

  const missing = []

  setReducersAliases(aliases, reducerMap, missing)

  setComposedReducers(composed, reducerMap, missing)

  guardAgainstAliasCycles(missing)

  setMissedReducersAliases(missing, reducerMap)

  setMissedComposedReducers(missing, reducerMap)

  guardAgainstMissingAliases(missing)

  return handleDispatch(reducerMap, actionKey)
}
