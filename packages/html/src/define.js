import { getKebabCase, hasOwn, destWeakMap } from '@newy/shared'

const puppet = Object.freeze({})
let cur

const { get: __ } = destWeakMap()

const genprops = self =>
  new Proxy(puppet, {
    get: (_, key) => {
      let _p = __(self)
      if (!_p.props) _p.props = {}

      if (hasOwn(_p.attrs, key)) {
        _p.props[key] = _p.attrs[key]
        delete _p.attrs[key]
      } else if (self.hasAttribute(key)) {
        _p.props[key] = self.getAttribute(key)
        self.removeAttribute(key)
      }

      return _p.props[key]
    }
  })

const genemit = self =>
  new Proxy(puppet, {
    get:
      (_, key) =>
      (...detail) => {
        let e = new CustomEvent(key, { detail })
        self.dispatchEvent(e)
      }
  })

function createLifecycleMethod(name) {
  return cb => {
    if (cur) {
      let _p = __(cur)
      ;(_p[name] || (_p[name] = [])).push(cb.bind(cur))
    }
  }
}

export const onCreated = createLifecycleMethod('_c')
export const onMounted = createLifecycleMethod('_m')
export const onUnmounted = createLifecycleMethod('_um')

function runcb(self, key) {
  let _p = __(self)
  _p[key] && _p[key].forEach(cb => cb())
}

export const define = new Proxy(puppet, {
  get: (_, _name) => f => {
    let name = getKebabCase(_name)
    if (customElements.get(name)) throw Error(`Duplicate definition ${_name}`)

    customElements.define(
      name,
      class extends HTMLElement {
        constructor() {
          super()
          const root = this.attachShadow({ mode: 'closed' })
          cur = this
          root.append(f.call(this, genprops(this), genemit(this)))
          cur = null
          runcb(this, '_c')
        }

        connectedCallback() {
          runcb(this, '_m')
        }
        disconnectedCallback() {
          runcb(this, '_um')
        }
      }
    )
  }
})
