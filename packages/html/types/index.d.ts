declare module '@newy/html' {
  import { Hook } from '@newy/shared'
  import { CompilerHook } from '@newy/compiler'
  export const onCreated: (cb: () => void) => void
  export const onMounted: (cb: () => void) => void
  export const onUnmounted: (cb: () => void) => void
  export const define: Record<
    string,
    (
      this: Element,
      props: Record<string, any>,
      emit: Record<string, (...args: any[]) => void>
    ) => Element
  >
  export type Use<T = any> = (plugin: (ctx: T) => Record<string, any> | void) => void
  export const use: Use

  type Render = (...nodes: any[]) => Element
  export const html: Render & {
    pure: Render
  }
  export type SCODKeys = ['style', 'class', 'on', 'dataset']
  export const BasePlugin: (ctx: { hook: CompilerHook }) => Record<string, any>

  export type Signal<T> = T extends (...args: any[]) => any
    ? () => T
    : {
        (): T
        (v: T): T
        (f: (v: T) => T): T
      }
  export type Raw<T> = (s: Signal<T>) => T

  type EffectOptions = {
    lazy?: boolean
    scheduler?: (...args: any[]) => any
    onStop?: () => void
  }
  type Runner<T> = {
    (): T
    effect: { stop: () => void }
  }
  class StateSignal<T> {
    constructor(initial: T): {
      (): T
      (v: T): T
      (f: (v: T) => T): T
    }
  }
  class ComputedSignal<T> {
    constructor(initial: T): () => T
  }
  export const initSignal: (Signal: {
    StateSignal: StateSignal
    ComputedSignal: ComputedSignal
    effect: <T = any>(fn: () => T, options?: EffectOptions) => Runner<T>
    stop: (runner: Runner<any>) => void
  }) => {
    $: Signal
    isSignal: (v: any) => v is Signal<any>
    ExtendSignalPlugin: (ctx: {
      hook: CompilerHook
      scodkeys: SCODKeys
      scodhook: Hook<SCODKeys>
    }) => Record<string, any>
  }
}
