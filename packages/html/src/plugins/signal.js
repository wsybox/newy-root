import { isDef, isUndef, isPrimitive, isBoolean, isFunction, isArray, genCtx } from '@newy/shared'
import { isTag, isVnode } from '@newy/compiler'
import { effect, isSignal, computed } from '@newy/signal'
import { html } from '../render'

const __ = genCtx()

export function ExtendSignalPlugin({ hook, scodkeys, scodhook }) {
  const dirtyNodeList = new WeakSet() // 脏节点列表

  function track(el, key, fn) {
    let _p = __(el)
    if (isUndef(_p.effects)) {
      _p.effects = new Map()
      dirtyNodeList.add(el)
    }
    _p.effects.set(key, effect(fn, { lazy: true }))
    return el
  }

  function untrack(el, key) {
    let { effects } = __(el)
    if (isDef(effects) && dirtyNodeList.has(el)) {
      if (isUndef(key)) {
        dirtyNodeList.delete(el)
        effects.forEach(r => stop(r))
        effects.clear()
      } else if (effects.has(key)) {
        stop(effects.get(key))
        effects.delete(key)
      }
    }
  }

  hook.compile((data, render) => {
    // signal<string | number> 默认渲染一个span，并使用signal.get(data)作为span的textContent
    if (isSignal(data) && isPrimitive(data())) {
      return render(dom => {
        const action = () => (dom.textContent = data().toString())
        action()
        track(dom, 'signalText', action)
      }, 'span')
    }
  })

  // 动态组件应返回的合法节点类型
  const legal = n => isPrimitive(n) || isBoolean(n) || isTag(n) || isVnode(n) || isArray(n)

  hook.compile((data, render) => {
    /**
     * 动态组件
     *
     * tag 也是函数， 但是在 运行 compile 钩子之前 tag 已经被处理
     * 除了 tag 之外的函数全当作动态组件处理
     */
    if (isFunction(data)) {
      return render(placeNode => {
        const rv = data()
        if (legal(rv)) {
          let fgm = html.pure(rv)
          let start = document.createComment(`__DYNAMIC_START__`)
          let end = document.createComment(`__DYNAMIC_END__`)
          fgm.insertBefore(start, fgm.firstChild)
          fgm.appendChild(end)
          const source = computed(data)
          placeNode.parentNode.replaceChild(fgm, placeNode)

          track(end, 'dynamic', () => {
            const parent = end.parentNode
            const node = source()
            if (legal(node)) {
              let next
              while ((next = start.nextSibling) !== end) parent.removeChild(next)
              parent.insertBefore(html.pure(node), end)
            }
          })
        }
      })
    }
  })

  scodkeys.forEach(key => {
    key !== 'on' &&
      scodhook[key]((name, data, dom) => {
        if (isSignal(data)) {
          const baseAction = scodhook[key]()[0]
          const action = () => baseAction(name, data(), dom)
          if (isDef(action())) {
            track(dom, `signalParam: ${key}.${name}`, action)
            return 1
          }
        }
      })
  })

  hook.param((name, data, setter) => {
    if (isSignal(data) && isPrimitive(data())) {
      const action = dom => dom.setAttribute(name, data())
      return setter(dom => {
        action(dom)
        track(dom, name, action)
      })
    }
  })

  return { track, untrack }
}
