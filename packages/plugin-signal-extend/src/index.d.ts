declare module '@newy/plugin-signal-extend' {
  type cb = (...args: any[]) => undefined | true
  type hook = {
    get: (key: string) => cb[] | undefined
    add: (key: string, fn: cb, i?: number) => void
  }
  type Ctx = {
    signal: {
      is: (r: unknown) => boolean
      get: <T extends any>(obj: unknown) => T
      computed: <T = any>(get: (val?: T) => T) => any
      effect: <T = any>(fn: () => T) => any
      stop: (runner: any) => void
    }
    parmhook: hook
    parmkeys: string[]
    keywords: string[]
  }
  type R = {
    track: (el: Node, key: string, fn: () => void) => Node
    untrack: (el: Node, key?: string) => void
  }

  export default (ctx: Ctx, hook: hook) => R
}
