import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: 'css' }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/ai-proxy/': {
        target: 'https://open.bigmodel.cn/api/paas/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-proxy\//, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err) => console.error('[AI Proxy Error]', err.message))
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[AI Proxy]', req.method, (req.url || '').substring(0, 100))
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[AI Proxy Response]', req.url?.substring(0, 60), '→', proxyRes.statusCode)
          })
        }
      }
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router'],
          'vendor-icons': ['@element-plus/icons-vue'],
          'vendor-chart': ['echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers'],
          'vendor-markdown': ['marked', 'dompurify'],
        }
      }
    }
  }
})
