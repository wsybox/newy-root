declare module '@newy/signal' {
  type Fn = (...args: any[]) => any

  type Signal<T> = {
    (): T
  } & T extends Fn
    ? never
    : {
        (v: T): T
        (f: (v: T) => T): T
      }

  type EffectOptions = {
    lazy?: boolean
    scheduler?: Fn
    onStop?: () => void
  }

  type Runner<T> = {
    (): T
    effect: { stop: () => void }
  }
  export function effect<T = any>(fn: () => T, options?: EffectOptions): Runner<T>
  export function stop(runner: Runner<any>): void

  export const isSignal: (val: unknown) => val is Signal<any>
  export const $: <T>(val: T) => Signal<T>
}
