const argumentsRegExp = /\(({[\s\S]*?})\)/
const normalizeAlias = (alias) => {
  const cleanAlias = alias.replace(argumentsRegExp, '').trim()
  const aliasArguments = alias.match(argumentsRegExp)

  return [cleanAlias, aliasArguments && JSON.parse(aliasArguments[1])]
}

export default normalizeAlias
