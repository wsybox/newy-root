import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

//
import { html, tag, $ } from 'newy'

const { div, a, img, h1, button, p } = tag

const counter = $(0)

document.querySelector('#app')!.append(
  html(
    div(
      a`href="https://vitejs.dev" target="_blank"`(
        img`src=${viteLogo} ddd=${123} class="logo" alt="Vite logo"`
      ),
      a`href="https://www.typescriptlang.org/" target="_blank"`(
        img`src=${typescriptLogo} class="logo vanilla" alt="TypeScript logo"`
      ),
      h1('Vite + TypeScript'),
      div`class="card"`(
        button`type="button" on=${{
          click() {
            counter(i => i + 1)
          }
        }}`('count is ', counter)
      ),
      p`class="read-the-docs"`('Click on the Vite and TypeScript logos to learn more')
    )
  )
)
