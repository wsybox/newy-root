import {
  isDef,
  isUndef,
  isPrimitive,
  isBoolean,
  isFunction,
  isArray,
  destWeakMap
} from '@newy/shared'
import { isTag, isVnode } from '@newy/compiler'
import { html } from '../render'

const { get: __ } = destWeakMap()

export function initSignal({ ComputedSignal, StateSignal, effect, stop }) {
  let signalCache = new WeakSet()
  const isSignal = obj => signalCache.has(obj)
  function $(value) {
    if (isSignal(value)) return value
    let r
    if (value instanceof StateSignal || value instanceof ComputedSignal) r = value
    else r = isFunction(value) ? new ComputedSignal(value) : new StateSignal(value)
    let readonly = r instanceof ComputedSignal
    function res(...args) {
      if (args.length > 1) throw Error('Expected 1 parameter, but got multiple')
      if (!readonly && args.length === 1) {
        let parm = args[0]
        r.set(isFunction(parm) ? parm(r.get()) : parm)
      }
      return r.get()
    }
    signalCache.add(res)
    return res
  }

  function ExtendSignalPlugin({ hook, scodkeys, scodhook }) {
    const dirtyNodeList = new WeakSet() // 脏节点列表

    function track(el, key, fn) {
      let _p = __(el)
      if (isUndef(_p.effects)) {
        _p.effects = new Map()
        dirtyNodeList.add(el)
      }
      _p.effects.set(key, effect(fn))
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
          let setter = () => (dom.textContent = data().toString())
          setter()
          track(dom, 'signalText', setter)
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
            const source = $(data)
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
            action()
            track(dom, `signalParam: ${key}.${name}`, action)
            return 1
          }
        })
    })

    hook.param((key, val, setter) => {
      if (isSignal(val) && isPrimitive(val())) {
        const action = dom => dom.setAttribute(key, val(val))
        return setter(dom => {
          action(dom)
          track(dom, key, action)
        })
      }
    })

    return { track, untrack, signal: { effect, stop, is: isSignal, state: $, raw: f => f() } }
  }

  return { isSignal, $, ExtendSignalPlugin }
}
