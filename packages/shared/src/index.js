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
// export const isSet = val => toTypeString(val) === '[object Set]'
export const getKebabCase = (str, separator = '-') => {
  let temp = str.replace(/[A-Z]/g, i => separator + i.toLowerCase())
  if (temp.slice(0, 1) === separator) temp = temp.slice(1)
  return temp
}

export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
export const isIntegerKey = key =>
  isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key
export const hasChanged = (value, oldValue) => !Object.is(value, oldValue)
export const extend = Object.assign

export const genCtx = () => {
  let map = new WeakMap()

  return p => {
    let res = map.get(p)
    if (!res) map.set(p, (res = {}))
    return res
  }
}

// export const raf = (task, rate = 16.6) => {
//   if (!isFunction(task)) throw TypeError('')
//   const start = Date.now()
//   requestAnimationFrame(() => {
//     if (Date.now() - start < rate) task()
//     else raf(task, rate)
//   })
// }

export const genhook = (...keys) => {
  let hook = new Map()

  const res = {}
  keys.forEach(key => {
    if (!isString(key)) throw TypeError('The parameter of function genhook must be a string')

    res[key] = (...args) => {
      let h = hook.get(key)
      if (args.length === 0) return h ? [...h] : h
      if (args.length >= 1 && isFunction(args[0])) {
        if (!h) hook.set(key, (h = []))
        if (args.length === 1) return h.push(args[0])
        if (args.length === 2 && isNumber(args[1])) return h.splice(args[1], 0, args[0])
      }
      throw Error(`The parameters of function ${key} do not match`)
    }
  })

  return res
}
