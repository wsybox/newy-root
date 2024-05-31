import { compiler, HTMLNeway } from '@newy/html'
import { isDef, isUndef, isPrimitive, isFunction, isArray, newy } from '@newy/shared'

export default ({ signal, parmhook, parmkeys }, hook) => {
  const dirtyNodeList = new WeakSet() // 脏节点列表

  const track = (el, key, fn) => {
    let n = newy(el)
    if (isUndef(n.effects)) {
      n.effects = new Map()
      dirtyNodeList.add(el)
    }
    n.effects.set(key, signal.effect(fn))
    return el
  }

  const untrack = (el, key) => {
    let { effects } = newy(el)
    if (isDef(effects) && dirtyNodeList.has(el)) {
      if (isUndef(key)) {
        dirtyNodeList.delete(el)
        effects.forEach(r => signal.stop(r))
        effects.clear()
      } else if (effects.has(key)) {
        signal.stop(effects.get(key))
        effects.delete(key)
      }
    }
  }

  hook.add('compile', data => {
    if (signal.is(data) && isPrimitive(signal.get(data))) {
      let dom = document.createTextNode(signal.get(data).toString())
      track(dom, 'signalText', () => (dom.textContent = signal.get(data).toString()))
      return dom
    }
  })

  hook.add('compile', data => {
    if (isFunction(data)) {
      const rv = data()
      let isarr = isArray(rv)
      if (rv instanceof HTMLNeway || isarr) {
        let fgm = document.createDocumentFragment()
        let start = document.createComment(`__DYNAMIC_START__`)
        let end = document.createComment(`__DYNAMIC_END__`)
        if (isarr) {
          fgm.append(start)
          compiler(fgm, rv).append(end)
        } else fgm.append(start, rv(), end)
        const source = signal.computed(data)

        track(end, 'dynamic', () => {
          const parent = end.parentNode
          const node = signal.get(source)

          let next
          while ((next = start.nextSibling) !== end) parent.removeChild(next)

          if (isArray(node) && node.length > 0)
            parent.insertBefore(compilerChildren(document.createDocumentFragment(), node), end)
          else if (node instanceof HTMLNeway) parent.insertBefore(node(), end)
        })

        return fgm
      }
    }
  })

  parmkeys.forEach(key => {
    key !== 'on' &&
      parmhook.add(key, (elm, name, data) => {
        if (signal.is(data)) {
          const baseAction = parmhook[key].get(0)
          const set = () => baseAction(elm, name, signal.get(data))
          set()
          track(elm, key + ':' + name, set)
          return true
        }
      })
  })

  hook.add('param', (elm, key, val) => {
    if (signal.is(val) && isPrimitive(signal.get(val))) {
      const set = () => elm.setAttribute(key, signal.get(val))
      set()
      track(elm, key, set)
      return true
    }
    return void 0
  })

  return { track, untrack }
}
