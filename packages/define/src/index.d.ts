declare module '@newy/define' {
  export const onCreated: (cb: () => void) => void
  export const onMounted: (cb: () => void) => void
  export const onUnmounted: (cb: () => void) => void
  export type define = Record<
    string,
    (
      this: HTMLElement,
      props: Record<string, any>,
      emit: Record<string, (...args: any[]) => void>
    ) => HTMLElement
  >
}
