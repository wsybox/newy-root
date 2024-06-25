declare module '@newy/signal' {
  export type Signal<T> = {
    (): T
    (v: T): T
    (f: (v: T) => T | void): T
  }
  export type ReadonlySignal<T> = () => T
  type EffectOptions = {
    lazy?: boolean
    scheduler?: (...args: any[]) => any
    onStop?: () => void
  }

  type Stop = () => void

  type Runner<T> = {
    (): T
    effect: { stop: Stop }
  }
  export type WatchSource<T = any> = Signal<T> | ReadonlySignal<T> | (() => T)
  export function effect<T = any>(fn: () => T, options?: EffectOptions): Runner<T>
  export function stop(runner: Runner<any>): void
  export function signal<T, R>(
    value: T,
    readonly: R = false
  ): R extends true
    ? ReadonlySignal<T>
    : T extends (args: any[]) => infer V
      ? ReadonlySignal<V>
      : Signal<T>
  export function computed<T>(getter: () => T): ReadonlySignal<T>
  export function isSignal(s: any): s is Signal<any> | ReadonlySignal<any>
  export function isReadonly(s: any): s is ReadonlySignal<any>
  export function toRaw<T>(s: Signal<T> | ReadonlySignal<T>): T
  export function scope(fn: () => void): Stop
  export function watch<T = any, S extends T | WatchSource<T> | (WatchSource<unknown> | object)[]>(
    source: S,
    cb: (v: S, ov: S | undefined) => void,
    options?: { deep?: boolean; immediate?: boolean }
  ): Runner<S>
}
