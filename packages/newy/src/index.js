import { HTMLNeway, tag, use } from '@newy/html'
import { $, isSignal, effect, stop } from '@newy/signal'
import signalExtendPlugin from '@newy/plugin-signal-extend'

use({
  is: isSignal,
  get: val => val(),
  computed: $,
  effect,
  stop
}).use(signalExtendPlugin)

export * from '@newy/define'
export { HTMLNeway, tag, use, $, isSignal, effect, stop }
