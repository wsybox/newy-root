import { hook } from '@newy/compiler'
import { isUndef } from '@newy/shared'

const pluginCtx = { hook }

export const use = fn => {
  let res = fn(pluginCtx)
  Object.keys(res).forEach(key => {
    if (isUndef(pluginCtx[key])) pluginCtx[key] = res[key]
  })
}
