// scripts/build.js
import { readdirSync, statSync } from 'fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const pkg = p => require(path.resolve(`packages/${p}/package.json`))

/*
const dirs = [
  [ 'define', 'dsl', 'shared' ],
  [ 'html', 'signal' ],
  [ 'plugin-signal-extend' ],
  [ 'newy' ]
]
*/
const dirs = []
const add = (dir, i) => {
  if (!dirs[i]) dirs[i] = []
  dirs[i].push(dir)
}

readdirSync('packages')
  .filter(dir => statSync(`packages/${dir}`).isDirectory())
  .map(dir => {
    const dep = pkg(dir).dependencies

    return {
      dir,
      deps: !dep
        ? dep
        : Object.keys(dep)
            .filter(key => key.startsWith('@newy/') && dep[key] === 'workspace:^')
            .map(k => k.slice(6))
    }
  })
  .sort((a, b) => {
    if (!a.deps) {
      if (!b.deps) return 0
      return -1
    }
    if (!b.deps) return 1
    if (b.deps.includes(a.dir)) return -1
    return 0
  })
  .forEach(({ dir, deps }) => {
    if (!deps) return add(dir, 0)

    let i,
      j,
      k = 0
    for (i = 0; i < deps.length; i++) {
      d: for (j = dirs.length - 1; j >= 0; j--) {
        if (dirs[j].includes(deps[i])) {
          if (k < j + 1) k = j + 1
          break d
        }
      }
    }

    add(dir, k)
  })

// 2、进行打包
export const run = task => {
  if (dirs.length > 0) task(dirs.shift()).then(() => run(task))
}
