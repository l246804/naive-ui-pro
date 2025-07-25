import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { ProNaiveUIResolver } from 'pro-naive-ui-resolver'
import UnoCSS from 'unocss/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
// import { analyzer } from 'vite-bundle-analyzer'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import { createHtmlPlugin } from 'vite-plugin-html'
import { preferenceConfig } from './preference'

export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd())
  return {
    optimizeDeps: {
      include: [
        'vue',
        'pinia',
        'naive-ui',
        'lodash-es',
        'vue-router',
        'pro-naive-ui',
        '@vueuse/core',
      ],
    },
    define: {
      __DEV__: mode === 'development',
    },
    plugins: [
      vue(),
      vueJsx(),
      createHtmlPlugin({
        inject: {
          data: {
            title: preferenceConfig.app.title,
          },
        },
      }),
      Components({
        resolvers: [
          NaiveUiResolver(),
          ProNaiveUIResolver(),
        ],
        dirs: [],
        dts: 'typings/components.d.ts',
      }),
      UnoCSS(),
      vitePluginFakeServer({
        logger: false,
        enableProd: true,
        infixName: false,
        include: ['mock'],
      }),
      // analyzer(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@root': path.resolve(__dirname, './'),
        '@pro/router': path.resolve(__dirname, './packages/router/src/index.ts'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'naive-ui': ['naive-ui'],
            'lodash-es': ['lodash-es'],
            'vue-router': ['vue-router'],
            'vueuse': ['@vueuse/core'],
            'pro-naive-ui': ['pro-naive-ui'],
            'vue': ['vue'],
            'pinia': ['pinia'],
            'iconify': ['@iconify/vue'],
          },
        },
      },
    },
  }
})
