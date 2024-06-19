## 一个描述 name, attribute, children 结构 的内部DSL

示例

```js
import init from '@newy/dsl'

let { n } = init()
let { div, a, img, h1, p, button } = n

let dom = div(
  a`href="https://vitejs.dev" target="_blank"`(img`src=${src1} class="logo" alt="Vite logo"`),
  a`href="https://www.typescriptlang.org/" target="_blank"`(
    img`src=${src2} class="logo vanilla" alt="TypeScript logo"`
  ),
  h1('Vite + TypeScript'),
  div`class="card"`(button`id="counter" type="button"`),
  p`class="read-the-docs"`('Click on the Vite and TypeScript logos to learn more')
)

console.log(dom)
```
