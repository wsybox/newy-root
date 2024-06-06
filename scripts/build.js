// scripts/build.js
import { execa } from 'execa'
import { run } from './get-dir'

async function build(TARGET) {
  await execa('rollup', ['-c', '--environment', `TARGET:${TARGET}`], { stdio: 'inherit' })
}

function runParaller(_dirs) {
  let result = []
  for (const dir of _dirs) {
    result.push(build(dir))
  }
  return Promise.all(result) // 存放打包的promise
}

// 2、进行打包
run(runParaller)
