import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { html, tag, signal } from 'newy'

const { div, a, img, h1, button, p } = tag
const counter = signal(0)

document
  .querySelector('#app')!
  .append(
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
          button`type="button" onclick=${() => counter(i => i + 1)}`('count is ', counter)
        ),
        p`class="read-the-docs"`('Click on the Vite and TypeScript logos to learn more')
      )
    )
  )
