import { Neway, Tag } from '@newy/dsl'

declare module '@newy/html' {
  type Fn = (...args: any[]) => any
  type Hook = {
    get: (key: string) => (Fn | undefined)[]
    add: (key: string, fn: Fn, i?: number) => void
  }
  type Obj = { [key in string]: any }
  type Use = (p: Obj | ((ctx: Obj, h: Hook) => Obj)) => { use: Use }
  export const hook: Hook
  export const use: Use
  export const compiler: <T extends Element | DocumentFragment>(parent: T, data: any) => T
  export type HTMLNeway = Neway<Element>
  export const tag: Tag<Element>
}
