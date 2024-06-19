declare module '@newy/dsl' {
  type Fn<R = any> = (...args: any[]) => R
  type Data = {
    name: string
    strings: TemplateStringsArray
    values: any[]
    children?: any[]
  }
  type InitReturn<T = Data> = {
    n: Record<string, Tag<T>>
    is: (tag: any) => tag is Tag<T>
    __conf: (tag: Tag<T>) => Record<string, any>
  }
  export type Tag<T = Data> = Fn<T> & {
    (strs: TemplateStringsArray, ...vals: any[]): Fn<T>
  }
  export type Config<T = Data> = {
    resolve?: (d: Data) => T
    progress?: (f1: Tag<T>, f2: Tag<T>) => void
  }

  type Init = <T = Data>(config?: Config<T>) => InitReturn<T>
  export const init: Init
}
