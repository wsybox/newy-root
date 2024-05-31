export const objectToString = Object.prototype.toString
export const toTypeString = val => objectToString.call(val)
export const isFunction = val => typeof val === 'function'
export const isArray = Array.isArray
export const isUndef = val => val === void 0
export const isDef = val => val !== void 0
export const isString = val => typeof val === 'string'
export const isSymbol = val => typeof val === 'symbol'
export const isObject = val => val !== null && typeof val === 'object'
export const isNumber = val => typeof val === 'number'
export const isBoolean = val => val === true || val === false
export const isPrimitive = val =>
  isString(val) || isNumber(val) || val instanceof String || val instanceof Number
export const isPlainObject = val => toTypeString(val) === '[object Object]'
export const isMap = val => toTypeString(val) === '[object Map]'
export const isSet = val => toTypeString(val) === '[object Set]'
export const getKebabCase = (str, separator = '-') => {
  let temp = str.replace(/[A-Z]/g, i => separator + i.toLowerCase())
  if (temp.slice(0, 1) === separator) temp = temp.slice(1)
  return temp
}

export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
export const isIntegerKey = key =>
  isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key
export const hasChanged = (value, oldValue) => !Object.is(value, oldValue)

const newyKey = '__newy__' //Symbol('')

export const newy = el => {
  if (!el[newyKey]) el[newyKey] = {}
  return el[newyKey]
}

export const raf = (task, rate = 16.6) => {
  const start = Date.now()
  requestAnimationFrame(() => {
    if (Date.now() - start < rate) task()
    else raf(task, rate)
  })
}
