import { isFunction } from '@newy/shared'
import { effect, stop } from './effect'
import { ComputedSignal, PrimitiveSignal } from './signal'

class Signal extends Function {
  _r
  readonly
  constructor(r, readonly) {
    super()
    this._r = r
    this.readonly = readonly
    return new Proxy(this, {
      apply({ readonly, _r }, _, args) {
        if (args.length > 1) throw Error('Expected 1 parameter, but got multiple')

        if (!readonly && args.length === 1) {
          let parm = args[0]
          _r.set(isFunction(parm) ? parm(_r.get()) : parm)
        }

        return _r.get()
      }
    })
  }
}

export { effect, stop }
export const isSignal = obj => obj instanceof Signal
export function $(value) {
  if (isSignal(value)) return value
  let r

  if (value instanceof PrimitiveSignal || value instanceof ComputedSignal) r = value
  else r = isFunction(value) ? new ComputedSignal(value) : new PrimitiveSignal(value)

  return new Signal(r, r instanceof ComputedSignal)
}
