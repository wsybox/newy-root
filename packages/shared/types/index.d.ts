declare module '@newy/shared' {
  export const objectToString: () => string
  export const toTypeString: (val: unknown) => string
  export const isFunction: (val: unknown) => val is Function
  export const isArray: (arg: any) => arg is any[]
  export const isUndef: (s: any) => s is undefined
  export const isDef: (s: any) => boolean
  export const isString: (val: unknown) => val is string
  export const isSymbol: (val: unknown) => val is symbol
  export const isObject: (val: unknown) => val is Record<any, any>
  export const isNumber: (val: unknown) => val is number
  export const isBoolean: (val: unknown) => val is boolean
  export const isPrimitive: (s: any) => s is string | number
  export const isPlainObject: (val: unknown) => val is object
  export const isMap: (val: unknown) => val is Map<any, any>
  // export const isSet: (val: unknown) => val is Set<any>
  export const getKebabCase: (str: string, separator?: string) => string
  export const hasOwn: (val: object, key: string | symbol) => key is never
  export const isIntegerKey: (key: unknown) => boolean
  export const hasChanged: (value: any, oldValue: any) => boolean
  export const genCtx: () => (p: any) => any
  type Fn = (...args: any[]) => any
  // export const raf: (task: Fn, rate?: number) => void
  export type Hook<T extends string[]> = {
    [s in T[number]]: {
      <F = Fn>(): F[] | undefined
      <F = Fn>(f: F): number
      <F = Fn>(f: F, i: number): []
    }
  }
  export const genhook: <T extends string[]>(...keys: T) => Hook<T>
}
