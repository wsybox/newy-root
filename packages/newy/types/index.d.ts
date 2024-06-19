declare module 'newy' {
  import { Signal } from '@newy/html'
  export const $: <T>(v: T) => Signal<T>
  export const isSignal: (v: any) => v is Signal<any>
  export { effect, stop } from '@newy/signal'
  export * from '@newy/html'
  export * from '@newy/compiler'
}
