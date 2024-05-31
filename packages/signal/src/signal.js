import {
  isArray,
  isPlainObject,
  isObject,
  isSymbol,
  hasOwn,
  isIntegerKey,
  hasChanged
} from '@newy/shared'
import {
  trigger,
  track,
  trackEffect,
  triggerEffects,
  ITERATE_KEY,
  activeEffect,
  shouldTrack,
  createDep,
  pauseTracking,
  resetTracking,
  pauseScheduling,
  resetScheduling,
  Effect,
  TriggerTypes
} from './effect'

export const signalMap = new WeakMap()
export const shallowSignalMap = new WeakMap()

function signal(obj, shallow = false) {
  if (obj[SignalFlags.RAW] && obj[SignalFlags.IS_SIGNAL]) return obj

  const proxyMap = shallow ? shallowSignalMap : signalMap
  const existingProxy = proxyMap.get(obj)
  if (existingProxy) return existingProxy

  const proxy = new Proxy(obj, {
    get(target, p, receiver) {
      if (p === SignalFlags.IS_SIGNAL) return true
      if (p === SignalFlags.IS_SHALLOW) return shallow
      if (p === SignalFlags.RAW) {
        if (
          receiver === (shallow ? shallowSignalMap : signalMap).get(target) ||
          Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)
        )
          return target
        return
      }

      const targetIsArray = isArray(target)

      if (targetIsArray && hasOwn(arrayInstrumentations, p)) {
        return Reflect.get(arrayInstrumentations, p, receiver)
      }
      if (p === 'hasOwnProperty') return hasOwnProperty

      const res = Reflect.get(target, p, receiver)
      if (isSymbol(p) ? builtInSymbols.has(p) : p === '__proto__') return res
      track(target, p)
      if (shallow) return res
      if (isRef(res)) return isArray(target) && isIntegerKey(p) ? res : res.get()
      if (isArray(res) || isPlainObject(res)) return signal(res)
      return res
    },
    set(target, p, value, receiver) {
      let oldValue = target[p]
      if (!shallow) {
        const isOldValueReadonly = isReadonly(oldValue)
        if (!isShallow(value) && !isReadonly(value)) {
          oldValue = toRaw(oldValue)
          value = toRaw(value)
        }
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          if (isOldValueReadonly) {
            return false
          } else {
            oldValue.set(value)
            return true
          }
        }
      }
      const hadKey =
        isArray(target) && isIntegerKey(p) ? Number(p) < target.length : hasOwn(target, p)
      const res = Reflect.set(target, p, value, receiver)

      if (target === toRaw(receiver)) {
        if (!hadKey) trigger(target, p, value, TriggerTypes.ADD)
        else if (hasChanged(value, oldValue)) trigger(target, p, value, TriggerTypes.SET)
      }
      return res
    },
    deleteProperty(target, p) {
      const hadKey = hasOwn(target, p)
      const res = Reflect.deleteProperty(target, p)
      if (res && hadKey) trigger(target, p, void 0, TriggerTypes.DELETE)
      return res
    },
    has(target, p) {
      if (!isSymbol(p) || !builtInSymbols.has(p)) track(target, p)
      return Reflect.has(target, p)
    },
    ownKeys(target) {
      track(target, isArray(target) ? 'length' : ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  })
  proxyMap.set(obj, proxy)
  return proxy
}

export class ComputedSignal {
  _value
  effect
  dep

  constructor(getter) {
    this.effect = new Effect(
      () => getter(this._value),
      () => triggerRefValue(this)
    )
  }

  get() {
    if (hasChanged(this._value, (this._value = this.effect.run()))) triggerRefValue(this)
    trackRefValue(this)
    return this._value
  }
}

export class PrimitiveSignal {
  _value
  _rawValue

  dep

  constructor(value) {
    this._rawValue = isObject(value) ? toRaw(value) : value
    this._value = isObject(value) ? toSignal(value) : value
  }

  get() {
    trackRefValue(this)
    return this._value
  }

  set(newVal) {
    const isObj = isObject(newVal)
    newVal = isObj ? toRaw(newVal) : newVal
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = isObj ? toSignal(newVal) : newVal
      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref) {
  if (shouldTrack && activeEffect) {
    ref = toRaw(ref)
    trackEffect(activeEffect, (ref.dep ??= createDep(() => (ref.dep = undefined))))
  }
}

export function triggerRefValue(ref) {
  ref = toRaw(ref)
  const dep = ref.dep
  if (dep) triggerEffects(dep)
}

const isRef = val => val instanceof PrimitiveSignal || val instanceof ComputedSignal

export const isShallow = value => !!(value && value[SignalFlags.IS_SHALLOW])

export const isReadonly = value => !!(value && value[SignalFlags.IS_READONLY])

export const toRaw = observed => {
  const raw = observed && observed[SignalFlags.RAW]
  return raw ? toRaw(raw) : observed
}

const toSignal = value => {
  if (!isObject(value)) return value
  return signal(value, !isArray(value) && !isPlainObject(value))
}

const SignalFlags = {
  IS_SIGNAL: '__is_signal__',
  IS_SHALLOW: '__is_shallow__',
  IS_READONLY: '__is_readonly__',
  RAW: '__raw__'
}

function hasOwnProperty(p) {
  if (!isSymbol(p)) p = String(p)
  const obj = toRaw(this)
  track(obj, p)
  return obj.hasOwnProperty(p)
}

const builtInSymbols = new Set(
  /*#__PURE__*/
  Object.getOwnPropertyNames(Symbol)
    // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
    // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
    // function
    .filter(p => p !== 'arguments' && p !== 'caller')
    .map(p => Symbol[p])
    .filter(isSymbol)
)

const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations()

function createArrayInstrumentations() {
  const instrumentations = {}

  ;['includes', 'indexOf', 'lastIndexOf'].forEach(p => {
    instrumentations[p] = function (...args) {
      const arr = toRaw(this)
      for (let i = 0, l = this.length; i < l; i++) track(arr, i + '')

      const res = arr[p](...args)
      if (res === -1 || res === false) {
        // if that didn't work, run it again using raw values.
        return arr[p](...args.map(toRaw))
      } else {
        return res
      }
    }
  })
  ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(p => {
    instrumentations[p] = function (...args) {
      pauseTracking()
      pauseScheduling()
      const res = toRaw(this)[p].apply(this, args)
      resetScheduling()
      resetTracking()
      return res
    }
  })
  return instrumentations
}
