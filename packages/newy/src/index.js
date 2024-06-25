import { use, BasePlugin, ExtendSignalPlugin } from '@newy/html'

use(BasePlugin)
use(ExtendSignalPlugin)

export * from '@newy/signal'
export { html, define, onCreated, onMounted, onUnmounted, use } from '@newy/html'
export { tag, isTag, isVnode } from '@newy/compiler'
