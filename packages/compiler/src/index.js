import { init } from '@newy/dsl'
import {
  isString,
  isPrimitive,
  isBoolean,
  isPlainObject,
  isMap,
  isFunction,
  getKebabCase,
  isArray,
  genhook
} from '@newy/shared'
export const hook = genhook('param', 'compile')

export const didp = {
  line: 'newy-dirty-id',
  hump: 'newyDirtyId'
}

let dirtyNodeCount = 0
let dirtypp = () => dirtyNodeCount++

let dirty = (dirtymap, dirtyTask) => {
  let id = dirtypp()
  dirtymap.set(id, dirtyTask)
  return id
}

let vcache = new WeakSet()

export const {
  n: tag,
  is: isTag,
  __conf
} = init({
  resolve({ name, strings, values, children }, { pure }) {
    let tagName = getKebabCase(name)
    let html = '<' + tagName
    let dirtymap = new Map()
    if (strings && strings.length >= 1) {
      const attrhtml = compilerAttribute(strings, values, dirtymap)
      html += ' ' + attrhtml
    }
    html += '>'
    if (children && children.length) {
      let { html: childrenhtml } = compiler(children, pure, dirtymap)
      html += childrenhtml
    }
    html += `</${tagName}>`

    let res = { html, dirtymap }
    vcache.add(res)
    return res
  }
})

export const isVnode = vnode => vcache.has(vnode)

const reg = /^(?![0-9-_.])[\w-.:]+$/
const err = i => new Error('compilerAttribute: TemplateStrings format error code: ' + i)

const compilerAttribute = (strings, values, dirtymap) => {
  let attrhtml = ''
  let paramTaskMap = new Map()

  let action =
    key =>
    (f, only = true) => {
      let old = paramTaskMap.get(key)
      if (!only) return paramTaskMap.set(key, old ? dom => (old(dom), f(dom)) : f), 1
      else if (!old) paramTaskMap.set(key, f), 1
    }

  if (values.length === 0) attrhtml = strings[0].trim()
  else {
    let strs = [...strings.raw]
    let paramhook = hook.param()
    let exist = paramhook && paramhook.length

    // 删除首尾空格
    strs.unshift(strs.shift().replace(/^\s*/g, ''))
    strs.push(strs.pop().replace(/\s*$/g, ''))

    strs = strs.map(str => str.split(/\s+/)).flat()

    let prev,
      current,
      key = '',
      val
    let clear = () => {
      key = ''
      val = void 0
    }
    let addattr = (k, v) => {
      if (!(exist && paramhook.some(f => f(k, v, action(k)) !== void 0)))
        attrhtml += `${k}=${isString(v) ? `'${v}'` : v} `
    }
    while (strs.length > 0) {
      current = strs.shift()

      // 遇到 空字符串或 =结尾 代表有插入动态数据
      if (current === '' || current.endsWith('=')) {
        prev = current
        current = strs.shift()
        if (current === '') {
          if (prev === '') {
            val = values.shift()
            if (isPlainObject(val)) {
              for (key in val) addattr(key, val[key])
              clear()
            } else throw err(1)
          } else {
            key = prev.slice(0, -1)
            if (reg.test(key)) {
              addattr(key, values.shift())
              clear()
            } else throw err(2)
          }
        } else throw err(3)
        prev = void 0
        current = void 0
      }
      // 正常字符串
      else {
        attrhtml += current + ' '
        current = void 0
      }
    }
  }

  if (paramTaskMap.size) {
    let id = dirty(dirtymap, dom => paramTaskMap.forEach(t => isFunction(t) && t(dom)))
    attrhtml = `data-${didp.line}='${id}' ${attrhtml}`
  }

  return attrhtml
}

export const compiler = (children, pure = false, dirtymap = new Map()) => {
  let html = ''
  let childhook = hook.compile()
  let exist = childhook && childhook.length

  let append = ({ html: h, dirtymap: m }) => {
    html += h
    if (isMap(m) && !Object.is(dirtymap, m) && m.size) {
      for ([key, val] of m) !dirtymap.has(key) && dirtymap.set(key, val)
      m.clear()
    }
  }

  let appendPlace = (dirtyTask, tagName = 'div') => {
    html += `<${tagName} data-${didp.line}='${dirty(dirtymap, dirtyTask)}' />`
    return 1
  }

  children.forEach(child => {
    if (isPrimitive(child) || isBoolean(child)) html += child
    else if (isArray(child)) append(compiler(child, pure, dirtymap))
    else if (isTag(child)) {
      let conf = __conf(child)
      let oldPure = conf.pure
      conf.pure = pure
      append(child())
      conf.pure = oldPure
    } else if (isVnode(child)) append(child)
    else if (!pure && exist) {
      let f, res
      for (f of childhook) if ((res = f(child, appendPlace)) !== void 0) break
      if (res === void 0) throw new Error('compile error')
    } else throw new Error('compile error')
  })

  return { html, dirtymap }
}
