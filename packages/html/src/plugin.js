import { hook } from '@newy/complier'

const pluginCtx = { hook }

export const use = fn => {
  let res = fn(pluginCtx)
  Object.keys(res).forEach(key => {
    if (pluginCtx[key] === void 0) pluginCtx[key] = res[key]
  })
}
