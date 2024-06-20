declare module 'newy' {
  export type Signal<T> = T extends (...args: any[]) => any
    ? () => T
    : {
        (): T
        (v: T): T
        (f: (v: T) => T): T
      }

  export const isSignal: (v: any) => v is Signal<any>
  export const $: <T>(v: T) => Signal<T>
  export type Use<T = any> = (plugin: (ctx: T) => Record<string, any> | void) => void
  export const use: Use

  type Render = (...nodes: any[]) => Element
  export const html: Render & {
    pure: Render
  }
  export const define: Record<
    string,
    (
      this: Element,
      props: Record<string, any>,
      emit: Record<string, (...args: any[]) => void>
    ) => Element
  >
  export const onCreated: (cb: () => void) => void
  export const onMounted: (cb: () => void) => void
  export const onUnmounted: (cb: () => void) => void

  type DirtyMap = Map<number, (dom: Element) => void>
  export type Vnode = { html: string; dirtymap: DirtyMap }
  type Fn<R = any> = (...args: any[]) => R
  export type Tag<T = Vnode> = {
    (strs: TemplateStringsArray, ...vals: any[]): Fn<T>
  } & Fn<T>
  export const tag: Record<string, Tag<Vnode>>
  export const isTag: (tag: any) => tag is Tag<Vnode>
  export const isVnode: (vnode: any) => vnode is Vnode

  type EffectOptions = {
    lazy?: boolean
    scheduler?: (...args: any[]) => any
    onStop?: () => void
  }
  type Runner<T> = {
    (): T
    effect: { stop: () => void }
  }
  export const effect: <T = any>(fn: () => T, options?: EffectOptions) => Runner<T>
  export const stop: (runner: Runner<any>) => void
}
