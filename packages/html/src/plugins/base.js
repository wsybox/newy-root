import {
  isFunction,
  isPlainObject,
  isString,
  isBoolean,
  isPrimitive,
  isArray,
  genhook
} from '@newy/shared'

export function BasePlugin({ hook }) {
  const scodkeys = ['style', 'class', 'on', 'dataset']
  const scodhook = genhook(...scodkeys)

  scodhook.style((key, val, dom) => {
    if (isString(val)) {
      dom.style[key] = val
      return 1
    }
  })
  scodhook.class((key, val, dom) => {
    if (isBoolean(val)) {
      dom.classList[val ? 'add' : 'remove'](key)
      return 1
    }
  })
  scodhook.on((key, val, dom) => {
    if (isFunction(val)) {
      dom.addEventListener(key, val)
      return 1
    }
  })
  scodhook.dataset((key, val, dom) => {
    if (isPrimitive(val) || isBoolean(val) || val === null) {
      dom.dataset[key] = val
      return 1
    }
  })
  hook.param((key, val, setter) => {
    if (scodkeys.includes(key) && isPlainObject(val)) {
      let cbs = scodhook[key]()
      return setter(dom => {
        Object.entries(val).forEach(([name, data]) => {
          let cb
          for (cb of cbs) if (cb(name, data, dom) !== void 0) break
        })
      }, ['on', 'dataset'].includes(key))
    } else if (key === 'style' && isString(val))
      return setter(dom => (dom.style.cssText += val), false)
    else if (key === 'class' && isArray(val))
      return setter(dom => val.forEach(name => isString(name) && dom.classList.add(name)), false)
    else if (key.startsWith('on') && key.length > 2 && isFunction(val))
      return setter(dom => dom.addEventListener(key.slice(2), val))
  })

  return {
    scodhook,
    scodkeys
  }
}
