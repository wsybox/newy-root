import { defineConfig } from 'rollup'
import { createRequire } from 'node:module'
import json from '@rollup/plugin-json'
import resolvePlugin from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
// import externals from 'rollup-plugin-node-externals' // 解析第三方插件
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 2.获取文件路径
const packagesDir = path.resolve(__dirname, 'packages')

// 2.1 获取需要打包的文件
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const resolve = p => path.resolve(packageDir, p)
// 2.2 获取每个包的配置项
const pkg = require(resolve('package.json')) // 获取 json

const name = path.basename(packageDir) // reactivity
// 3、创建一个映射表
const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'esm'
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'
  }
}

const packageOptions = pkg.buildOptions || {}

// 1、创建一个打包配置
function createConfig(format, output) {
  let external = [],
    deps
  if (packageOptions.external && (deps = pkg.dependencies)) {
    external = Object.keys(deps).filter(key => deps[key].startsWith('workspace:'))
  }
  const isGlobalBuild = /global/.test(format)

  if (isGlobalBuild) {
    output.name = packageOptions.name
    if (packageOptions.external && deps && external.length) {
      output.globals = {}
      external.forEach(key => {
        output.globals[key] = key.replace(/(@|\/)+([a-z]){1}/g, (_, _1, s) => s.toUpperCase())
      })
    }
  }

  output.sourcemap = false

  // 生成rollup配置
  const config = {
    external,
    input: resolve(`src/index.js`), // 输入
    output, // 输出
    plugins: [json(), resolvePlugin(), terser()]
  }
  return config
}

const packageFormats = packageOptions.formats

const packageConfigs = packageFormats.map(format => createConfig(format, outputConfigs[format]))
export default defineConfig(packageConfigs)
