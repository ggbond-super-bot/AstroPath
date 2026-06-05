import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
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
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api/ai-proxy': {
          target: 'https://open.bigmodel.cn/api/paas/v4',
          changeOrigin: true,
          rewrite: () => '/chat/completions',
          headers: {
            'Authorization': `Bearer ${env.VITE_ZHIPU_API_KEY}`,
          },
        },
      },
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
          },
        },
      },
    },
  }
})
