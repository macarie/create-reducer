import formatPairs from './format-pairs.js'

const guardAgainstUnresolved = (unresolved) => {
  if (unresolved.length > 0) {
    throw new TypeError(
      `It wasn't possible to locate some aliases, the missing (key => value) pairs are: ${formatPairs(
        unresolved
      )}.`
    )
  }
}

export default guardAgainstUnresolved
