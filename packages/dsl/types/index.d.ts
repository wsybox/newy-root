declare module '@newy/dsl' {
  type Data = {
    name: string
    strs: TemplateStringsArray
    vals: any[]
    children?: any[]
  }
  export type Tag<T = Data> = { [s in string]: Neway<T> }
  export type Neway<T = Data> = {
    (strs: TemplateStringsArray, ...vals: any[]): Neway<T>
    (...args: any[]): T
    render(data: Data): T
  }
  export const init: <T = Data>(proto?: Neway<T>) => Tag<T> & ((conf: any) => Tag<T>)
}
