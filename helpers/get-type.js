const objectRegExp = /^\[object (.*?)]$/
const getType = (object) =>
  Object.prototype.toString
    .call(object)
    .replace(objectRegExp, '$1')
    .toLowerCase()

export default getType
