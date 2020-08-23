import formatPairs from './format-pairs.js'

const guardAgainstCycles = (pairs) => {
  const startingIndex = pairs.length - 1

  for (let index = startingIndex; index >= 0; index -= 1) {
    for (let nestedIndex = index; nestedIndex >= 0; nestedIndex -= 1) {
      if (
        pairs[index][0] === pairs[nestedIndex][1] &&
        pairs[index][1] === pairs[nestedIndex][0]
      ) {
        throw new TypeError(
          `Found an infinite cycle, the (key => value) pairs are: ${formatPairs(
            [pairs[index], pairs[nestedIndex]]
          )}.`
        )
      }
    }
  }
}

export default guardAgainstCycles
