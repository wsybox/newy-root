declare module '@newy/signal' {
  type EffectOptions = {
    lazy?: boolean
    scheduler?: (...args: any[]) => any
    onStop?: () => void
  }

  type Runner<T> = {
    (): T
    effect: { stop: () => void }
  }
  export function effect<T = any>(fn: () => T, options?: EffectOptions): Runner<T>
  export function stop(runner: Runner<any>): void

  export class StateSignal<T> {
    constructor(initial: T): {
      (): T
      (v: T): T
      (f: (v: T) => T): T
    }
  }
  export class ComputedSignal<T> {
    constructor(initial: T): () => T
  }
}
