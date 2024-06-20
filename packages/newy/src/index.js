import * as Signal from '@newy/signal'
import { use, BasePlugin, initSignal } from '@newy/html'

use(BasePlugin)
const { isSignal, $, ExtendSignalPlugin } = initSignal(Signal)
use(ExtendSignalPlugin)

export { isSignal, $, use }
export { html, define, onCreated, onMounted, onUnmounted } from '@newy/html'
export { tag, isTag, isVnode } from '@newy/compiler'
export const { effect, stop } = Signal
