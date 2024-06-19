import * as Signal from '@newy/signal'
import { use, BasePlugin, initSignal } from '@newy/html'

use(BasePlugin)
const { isSignal, $, ExtendSignalPlugin } = initSignal(Signal)
use(ExtendSignalPlugin)

export { isSignal, $ }
export * from '@newy/html'
export const { effect, stop } = Signal
