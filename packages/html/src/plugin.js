import {
  isDef,
  isFunction,
  isPlainObject,
  isString,
  isUndef,
  isBoolean,
  isPrimitive
} from '@newy/shared'

let genhook = _cbs => ({
  get: key => _cbs[key] || (_cbs[key] = []),
  add(key, fn, i = -1) {
    return i >= 0 ? this.get(key).splice(i, 0, fn) : this.get(key).push(fn)
  }
})

let pcbs = {
  class: [
    (elm, key, val) => {
      if (isBoolean(val)) {
        elm.classList[val ? 'add' : 'remove'](key)
        return true
      }
    }
  ],
  style: [
    (elm, key, val) => {
      if (isString(val)) {
        elm.style[key] = val
        return true
      }
    }
  ],
  on: [
    (elm, key, val) => {
      if (isFunction(val)) {
        elm.addEventListener(key, val)
        return true
      }
    }
  ],
  data: [
    (elm, key, val) => {
      if (isPrimitive(val) || isBoolean(val) || val === null) {
        elm.dataset[key] = val
        return true
      }
    }
  ]
}

let ctx = {
  parmhook: genhook(pcbs),
  parmkeys: Object.keys(pcbs)
}
let cbs = {
  param: [
    (elm, key, val) => {
      if (isString(val) && key === 'style') return !!(elm.style.cssText += val)
      else if (Array.isArray(val) && key === 'class') {
        val.forEach(name => typeof name === 'string' && elm.classList.add(name))
        return true
      } else if (isFunction(val) && key.startsWith('on') && key.length > 2) {
        elm.addEventListener(key.slice(2), val)
        return true
      } else if (isPlainObject(val) && ctx.parmkeys.includes(key)) {
        Object.entries(val).forEach(([name, data]) => {
          let cb
          for (cb of pcbs[key]) if (cb(elm, name, data)) break
        })

        return true
      }
      return void 0
    }
  ]
}
export const hook = genhook(cbs)

let _use = {
  use(p) {
    let _ctx = isFunction(p) ? p(ctx, hook) : p
    if (isDef(_ctx)) {
      let key
      for (key in _ctx) if (isUndef(ctx[key])) ctx[key] = _ctx[key]
    }
    return this
  }
}

export const use = _use.use
