const formatPairs = (pairs) =>
  pairs
    .map((pair) => `(${pair.map((value) => `'${value}'`).join(' => ')})`)
    .join(', ')

export default formatPairs
