const puppet = Object.freeze({})

const _te = (parm, type) => {
  if (!!parm && typeof parm !== type) throw TypeError(`Parameter ${parm} must be a ${type}`)
}

export const init = (config = {}) => {
  let _cache = new WeakSet()
  let _confMap = new WeakMap()
  let { resolve, progress } = {
    resolve: data => ({
      ...data,
      children: data.children.map(f => (_cache.has(f) ? f() : f))
    }),
    ...config
  }
  _te(resolve, 'function')
  _te(progress, 'function')

  let _progress = (f1, f2) => {
    _cache.add(f1)
    if (f2) _confMap.set(f1, _confMap.get(f2))
    if (progress) progress(f1, f2)
    return f1
  }

  function _resolve(conf, ...children) {
    return resolve({ ...this, children }, conf)
  }

  let _handle = other => ({
    get: (_, name) => {
      let _conf = {}
      let f = (conf, ...args) => {
        if (
          Array.isArray(args[0]) &&
          args[0].every(s => typeof s === 'string') &&
          args[0].hasOwnProperty('raw') &&
          args.length === args[0].length
        ) {
          let [strings, ...values] = args
          return _progress(_resolve.bind({ ...other, name, strings, values }, conf), f)
        }

        return _resolve.call({ ...other, name }, conf, ...args)
      }
      f = f.bind(null, _conf)
      _confMap.set(f, _conf)

      return _progress(f)
    }
  })

  return {
    n: new Proxy(
      other => (_te(other, 'object'), new Proxy(puppet, _handle(other || puppet))),
      _handle(puppet)
    ),
    is: f => _cache.has(f),
    __conf: f => _confMap.get(f)
  }
}
