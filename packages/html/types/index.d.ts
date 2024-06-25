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
  export function ExtendSignalPlugin(ctx: {
    hook: CompilerHook
    scodkeys: SCODKeys
    scodhook: Hook<SCODKeys>
  }): Record<string, any>
}
