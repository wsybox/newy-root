import { getKebabCase, hasOwn, newy } from '@newy/shared'

let _t = {},
  cur

const genprops = that =>
  new Proxy(_t, {
    get: (_, key) => {
      let n = newy(that)
      if (!n.props) n.props = {}

      if (hasOwn(n.attrs, key)) {
        n.props[key] = n.attrs[key]
        delete n.attrs[key]
      } else if (that.hasAttribute(key)) {
        n.props[key] = that.getAttribute(key)
        that.removeAttribute(key)
      }

      return n.props[key]
    }
  })

const genemit = that =>
  new Proxy(_t, {
    get:
      (_, key) =>
      (...detail) => {
        let e = new CustomEvent(key, { detail })
        that.dispatchEvent(e)
      }
  })

function createLifecycleMethod(name) {
  return cb => {
    if (cur) {
      let n = newy(cur)
      ;(n[name] || (n[name] = [])).push(cb.bind(cur))
    }
  }
}

export const onCreated = createLifecycleMethod('_c')
export const onMounted = createLifecycleMethod('_m')
export const onUnmounted = createLifecycleMethod('_um')

const runcb = (that, key) => {
  let n = newy(that)
  n[key] && n[key].forEach(cb => cb())
}

export const define = new Proxy(_t, {
  get: (_, _name, __) => f => {
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
