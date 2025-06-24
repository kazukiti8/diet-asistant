import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Piniaストアの設定
config.global.plugins = [createPinia()]

// グローバルなモック設定
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Chart.jsのモック
global.Chart = class Chart {
  constructor() {}
  destroy() {}
  update() {}
} 