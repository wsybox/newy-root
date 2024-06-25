import { extend, isArray, isFunction, isObject, hasChanged } from '@newy/shared'

function extendSignal(value, readonly, action, other = {}) {
  return extend(action, other, {
    [SignalFlags.SIGNAL]: true,
    [SignalFlags.READONLY]: readonly,
    [SignalFlags.RAW]: value
  })
}

const SignalFlags = {
  SIGNAL: '__is_signal__',
  READONLY: '__is_readonly__',
  RAW: '__signal_raw__'
}

let activeEffect = void 0 // 当前执行的effect
let shouldTrack = false // 是否需要进行依赖收集

const depMap = new WeakMap()
function track(signal) {
  if (shouldTrack && activeEffect) {
    let dep = depMap.get(signal)
    if (!dep) depMap.set(signal, (dep = new Set()))
    dep.add(activeEffect)
    if (!activeEffect.deps) activeEffect.deps = new Set()
    activeEffect.deps.add(dep)
  }
}

function trigger(signal) {
  const dep = depMap.get(signal)
  if (dep && dep.size) {
    let _effect
    for (_effect of dep) if (!_effect._runnings) _effect.scheduler()
  }
}

class SignalEffect {
  _runnings = 0
  active = true
  lazy = false
  deps
  onStop
  constructor(fn, scheduler) {
    this.fn = fn
    this.scheduler = scheduler
  }

  run() {
    // 调用stop后不需要收集依赖
    if (!this.active) return this.fn()

    // 收集依赖
    let lastEffect = activeEffect
    let lastShouldTrack = shouldTrack
    try {
      shouldTrack = true
      activeEffect = this
      this._runnings++
      return this.fn()
    } finally {
      this._runnings--
      activeEffect = lastEffect
      shouldTrack = lastShouldTrack
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this)
      if (this.onStop) this.onStop()
    }
  }
}

function cleanupEffect(_effect) {
  const { deps } = _effect
  if (deps && deps.size) {
    let dep
    for (dep of deps) dep.delete(_effect)
    deps.clear()
  }
}

function getRunner(_effect) {
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  if (runnerStack) runnerStack.push(runner)
  return runner
}

let runnerStack

export function scope(fn) {
  let lastRunnerStack = runnerStack
  runnerStack = []
  fn()
  let runners = runnerStack
  runnerStack = lastRunnerStack

  return () => runners.forEach(stop)
}

export function effect(fn, options = {}) {
  const _effect = new SignalEffect(fn, () => _effect.run())
  extend(_effect, options)
  if (!_effect.lazy) _effect.run()
  return getRunner(_effect)
}

export function watch(source, cb, options = {}) {
  let { deep, immediate } = extend({ deep: false, immediate: false }, options)
  let oldValue = void 0
  let getter = isArray(source) ? () => source.map(s => s()) : () => source()

  function scheduler() {
    let newValue = _effect.run()
    if (deep || hasChanged(newValue, oldValue)) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }

  const _effect = new SignalEffect(getter, scheduler)
  extend(_effect, { lazy: true }, options)

  if (immediate) scheduler()
  else oldValue = _effect.run()

  return getRunner(_effect)
}

export function stop(runner) {
  runner.effect.stop()
}

export function computed(getter) {
  if (!isFunction(getter)) throw Error('Parameter getter must be a function')
  const existingSignal = readonlySignalMap.get(getter)
  if (existingSignal) return existingSignal

  let value

  const signal = extendSignal(value, true, () => {
    if (hasChanged(value, (value = _effect.run()))) trigger(signal)
    track(signal)
    return value
  })
  const _effect = new SignalEffect(
    () => getter(value),
    () => trigger(signal)
  )
  extend(_effect, {
    onStop() {
      readonlySignalMap.delete(getter)
    }
  })
  extend(signal, {
    effect: _effect,
    runner: getRunner(_effect)
  })
  readonlySignalMap.set(getter, signal)

  return signal
}

const signalMap = new WeakMap()
const readonlySignalMap = new WeakMap()

export function signal(value, readonly = false) {
  if (isSignal(value)) return value
  if (isFunction(value)) return computed(value)

  const isObj = isObject(value)
  let _signalMap
  if (isObj) {
    _signalMap = readonly ? readonlySignalMap : signalMap
    const existingSignal = _signalMap.get(value)
    if (existingSignal) return existingSignal
    if (readonly) Object.freeze(value)
  }

  function getter() {
    track(_signal)
    return value
  }

  const _signal = extendSignal(
    value,
    readonly,
    readonly
      ? getter
      : (...args) => {
          let len = args.length
          if (!len) return getter()
          if (readonly || len > 1) throw Error(`Expected ${+!readonly} parameter, but got ` + len)

          let newVal = args[0]
          if (isFunction(newVal)) {
            let _val = newVal(value)
            if (_val !== void 0) value = _val
          } else value = newVal
          trigger(_signal)
          return value
        }
  )
  if (isObj) _signalMap.set(value, _signal)

  return _signal
}

export const isSignal = s => !!(s && s[SignalFlags.SIGNAL])
export const isReadonly = s => !!(s && s[SignalFlags.READONLY])
export const toRaw = s => {
  while (isSignal(s)) s = s[SignalFlags.RAW]
  return s
}
