## 声明式DOM库

[项目地址](https://github.com/wsybox/newy-root)

示例

```js
import { tag, html } from 'newy'

let { div, a, img, h1, p, button } = tag

let dom = html(
  div(
    a`href="https://vitejs.dev" target="_blank"`(img`src=${src1} class="logo" alt="Vite logo"`),
    a`href="https://www.typescriptlang.org/" target="_blank"`(
      img`src=${src2} class="logo vanilla" alt="TypeScript logo"`
    ),
    h1('Vite + TypeScript'),
    div`class="card"`(button`id="counter" type="button"`),
    p`class="read-the-docs"`('Click on the Vite and TypeScript logos to learn more')
  )
)

document.querySelector('body').append(dom)
```
