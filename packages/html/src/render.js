import { compiler, didp } from '@newy/compiler'

const nodeCache = new Map()
const t = document.createElement('template')
function template(html, wrap = false) {
  let node = nodeCache.get(html)
  try {
    if (!node) {
      t.innerHTML = html
      nodeCache.set(html, (node = t.content))
    }
    if (!wrap && node.childNodes.length === 1) node = node.firstChild

    return node.cloneNode(true)
  } finally {
    t.innerHTML = ''
  }
}

const render =
  pure =>
  (...nodes) => {
    let { html, dirtymap } = compiler(nodes, pure)
    let res = template(html, true)

    if (dirtymap.size) {
      let nodeIterator = document.createNodeIterator(res, NodeFilter.SHOW_ELEMENT, node => {
        if (node.nodeType === 1 && node.dataset[didp.hump]) return NodeFilter.FILTER_ACCEPT
        return NodeFilter.FILTER_SKIP
      })

      let node
      while ((node = nodeIterator.nextNode())) {
        const id = +node.dataset[didp.hump]
        dirtymap.has(id) && dirtymap.get(id)(node)
      }

      dirtymap.clear()
    }

    return res
  }

export const html = Object.assign(render(), {
  pure: render(true) // pure 模式: compile 不会被调用
})
