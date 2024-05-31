import {
  isBoolean,
  isNumber,
  isPlainObject,
  isPrimitive,
  isString,
  isArray,
  getKebabCase,
  hasOwn,
  newy,
  raf
} from '@newy/shared'
import { init, Neway } from '@newy/dsl'
import { hook } from './plugin'

const reg = /^(?![0-9-_.])[\w-.:]+$/
const err = i => new Error('compilerAttribute: TemplateStrings format error code: ' + i)

const compilerAttribute = (strs, vals) => {
  let attr = ''
  let parm = [{}]
  let setParm = (key, val) => {
    if (hasOwn(parm[0], key)) parm.unshift({ [key]: val })
    else parm[0][key] = val
  }

  if (vals.length === 0) attr = strs[0].trim()
  else {
    let tags = [...strs.raw]

    // 删除首尾空格
    tags.unshift(tags.shift().replace(/^\s*/g, ''))
    tags.push(tags.pop().replace(/\s*$/g, ''))

    tags = tags.map(str => str.split(/\s+/)).flat()

    let prev,
      current,
      key = '',
      val
    let clear = () => {
      key = ''
      val = void 0
    }
    while (tags.length > 0) {
      current = tags.shift()

      // 遇到 空字符串\cut 结尾 代表有插入动态数据
      if (current === '' || current.endsWith('=')) {
        prev = current
        current = tags.shift()
        if (current === '') {
          if (prev === '') {
            val = vals.shift()
            if (isPlainObject(val)) {
              parm.unshift({}, val)
              clear()
            } else throw err(1)
          } else {
            const key = prev.slice(0, -1)
            if (reg.test(key)) {
              val = vals.shift()
              setParm(key, val)
              clear()
            } else throw err(2)
          }
        } else throw err(3)
        prev = void 0
        current = void 0
      }
      // 正常字符串
      else {
        attr += current + ' '
        current = void 0
      }
    }
  }

  return { attr, parm }
}

const nodeCache = new Map()
nodeCache.size
const template = html => {
  let node = nodeCache.get(html)
  if (!node) {
    const t = document.createElement('template')
    t.innerHTML = html
    nodeCache.set(html, (node = t.content.firstChild))
  }

  return node.cloneNode(true)
}

const compilerParm = (elm, attrs) => {
  let key,
    val,
    cb,
    cbs = hook.get('param')
  ref: for (key in attrs) {
    val = attrs[key]
    for (cb of cbs)
      if (cb(elm, key, val)) continue ref
      else if (isPrimitive(val) || isBoolean(val) || val === null) elm.setAttribute(key, val)
  }
}

export class HTMLNeway extends Neway {
  render({ name, strs, vals, children }) {
    let tag = getKebabCase(name),
      dom
    if (strs && strs.length >= 1) {
      let { attr, parm } = compilerAttribute(strs, vals)
      dom = template(`<${tag} ${attr} />`)

      if (parm.length > 0) {
        const n = newy(dom)
        n.attrs = Object.assign(...parm)
      }
    } else dom = template(`<${tag}/>`)

    const run = !customElements.get(tag) ? t => t() : raf

    run(() => {
      const n = newy(dom)
      if (n.attrs && Object.keys(n.attrs).length > 0) compilerParm(dom, n.attrs)
    })
    run(() => {
      if (children && children.length > 0) compiler(dom, children)
    })
    return dom
  }
}

export const compiler = (parent, data) => {
  if (data instanceof HTMLNeway) parent.append(data())
  else if (isArray(data) && data.length > 0) data.forEach(ch => compiler(parent, ch))
  else if (data instanceof Node || isString(data)) parent.append(data)
  else if (isBoolean(data) || isNumber(data)) parent.append(data + '')
  else {
    let cb,
      dom,
      cbs = hook.get('compile')
    for (cb of cbs) {
      dom = cb(data)
      if (dom && isNode(dom)) {
        parent.append(dom)
        dom = void 0
        break
      }
    }
  }

  return parent
}

export const tag = init(HTMLNeway)
