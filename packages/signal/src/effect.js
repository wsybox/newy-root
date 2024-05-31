import { isSymbol, isArray } from '@newy/shared'
export const TriggerTypes = {
  ADD: 'add',
  SET: 'set',
  DELETE: 'delete'
}

export const ITERATE_KEY = Symbol('')

export let activeEffect = void 0 // 当前执行的effect
export let shouldTrack = false // 是否需要进行依赖收集

const trackStack = []

export function pauseTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = false
}

export function resetTracking() {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}

let pauseScheduleStack = 0
const queueEffectSchedulers = []

export function pauseScheduling() {
  pauseScheduleStack++
}

export function resetScheduling() {
  pauseScheduleStack--
  while (!pauseScheduleStack && queueEffectSchedulers.length) {
    queueEffectSchedulers.shift()()
  }
}

export class Effect {
  fn
  deps = []
  active = true // 防止在同一时间调用多次stop
  lazy = false
  onStop // stop 回调函数
  _trackId = 0
  _runnings = 0
  _depsLength = 0

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
      preCleanupEffect(this)
      return this.fn()
    } finally {
      postCleanupEffect(this)
      this._runnings--
      activeEffect = lastEffect
      shouldTrack = lastShouldTrack
    }
  }

  stop() {
    if (this.active) {
      preCleanupEffect(this)
      postCleanupEffect(this)
      if (this.onStop) this.onStop()
      this.active = false
    }
  }
}

export function effect(fn, options = {}) {
  const _effect = new Effect(fn, () => _effect.run())
  Object.assign(_effect, options)
  if (!_effect.lazy) _effect.run()
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const targetMap = new WeakMap()

export function createDep(cleanup, computed) {
  const dep = new Map()
  dep.cleanup = cleanup
  if (computed) dep.computed = computed
  return dep
}

function preCleanupEffect(effect) {
  effect._trackId++
  effect._depsLength = 0
}

function postCleanupEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanupDepEffect(effect.deps[i], effect)
    }
    effect.deps.length = effect._depsLength
  }
}

function cleanupDepEffect(dep, effect) {
  const trackId = dep.get(effect)
  if (trackId !== undefined && effect._trackId !== trackId) {
    dep.delete(effect)
    if (dep.size === 0) {
      dep.cleanup()
    }
  }
}

export function track(target, key) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) targetMap.set(target, (depsMap = new Map()))
    let dep = depsMap.get(key)
    if (!dep) depsMap.set(key, (dep = createDep(() => depsMap.delete(key))))

    trackEffect(activeEffect, dep)
  }
}

export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)
    const oldDep = effect.deps[effect._depsLength]
    if (oldDep !== dep) {
      if (oldDep) cleanupDepEffect(oldDep, effect)
      effect.deps[effect._depsLength++] = dep
    } else effect._depsLength++
  }
}

export function trigger(target, p, value, type) {
  let depsMap = targetMap.get(target)
  if (!depsMap) return

  let deps = []
  if (p === 'length' && isArray(target)) {
    const newLength = Number(value)
    depsMap.forEach((dep, key) => {
      if (key === 'length' || (!isSymbol(key) && key >= newLength)) deps.push(dep)
    })
  } else {
    if (p !== void 0) deps.push(depsMap.get(p))

    switch (type) {
      case TriggerTypes.ADD:
        if (!isArray(target)) deps.push(depsMap.get(ITERATE_KEY))
        else if (isIntegerKey(p)) deps.push(depsMap.get('length'))
        break
      case TriggerTypes.DELETE:
        if (!isArray(target)) deps.push(depsMap.get(ITERATE_KEY))
        break
    }
  }

  let dep
  for (dep of deps) if (dep) triggerEffects(dep)
}

export function triggerEffects(dep) {
  pauseScheduling()
  let effect
  for (effect of dep.keys())
    if (dep.get(effect) === effect._trackId && !effect._runnings)
      queueEffectSchedulers.push(effect.scheduler)
  resetScheduling()
}

export function stop(runner) {
  runner.effect.stop()
}
