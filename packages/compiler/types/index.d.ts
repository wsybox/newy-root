declare module '@newy/compiler' {
  import { Tag } from '@newy/dsl'
  import { Hook } from '@newy/shared'
  type Fn = (...args: any[]) => any
  export type CompilerHook = Hook<['param', 'compile']>
  export const hook: CompilerHook
  export const didp: {
    line: string
    hump: string
  }
  type DirtyMap = Map<number, (dom: Element) => void>
  type Vnode = { html: string; dirtymap: DirtyMap }
  export const tag: Record<string, Tag<Vnode>>
  export const isTag: (tag: any) => tag is Tag<Vnode>
  export const __conf: (tag: Tag<Vnode>) => Record<string, any>
  export const d: {
    tag: Tag<Vnode>
    isTag: (tag: any) => tag is Tag<Vnode>
    __conf: (tag: Tag<Vnode>) => Record<string, any>
  }
  export const isVnode: (vnode: any) => vnode is Vnode
  export const compiler: (children: any[], pure?: boolean, dirtymap?: DirtyMap) => Vnode
}
