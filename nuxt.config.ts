// https://nuxt.com/docs/api/configuration/nuxt-config
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, 'src')

/** Запрет индексации и следования по ссылкам для всех ответов и HTML. */
const NOINDEX_ROBOTS =
  'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      titleTemplate: '%s — IWA 360',
      title: 'Личный кабинет',
      meta: [
        {
          name: 'description',
          content:
            'Личный кабинет IWA 360: обзор, компания, пользователи и сервисы.',
        },
        { name: 'robots', content: NOINDEX_ROBOTS },
        { name: 'googlebot', content: NOINDEX_ROBOTS },
        { name: 'bingbot', content: NOINDEX_ROBOTS },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Robots-Tag': NOINDEX_ROBOTS,
      },
    },
  },

  srcDir: 'src',
  dir: {
    app: 'app',
    pages: 'app/routes',
    layouts: 'app/layouts',
    middleware: 'app/middleware',
    plugins: 'app/plugins',
    public: '../public',
  },

  alias: {
    '@app': resolve(src, 'app'),
    '@pages': resolve(src, 'pages'),
    '@entities': resolve(src, 'entities'),
    '@features': resolve(src, 'features'),
    '@widgets': resolve(src, 'widgets'),
    '@shared': resolve(src, 'shared'),
    '@lib': resolve(src, 'shared/lib'),
  },

  components: [
    { path: 'shared/ui', pathPrefix: false },
    { path: 'widgets', pathPrefix: true },
    { path: 'features', pathPrefix: true },
    { path: 'entities', pathPrefix: true },
  ],

  css: ['~/app/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    // Inter подключается в `src/app/assets/css/main.css` (@import Google Fonts).
    // Модуль @nuxt/fonts в dev дергает Fontsource API и при сетевых сбоях может провоцировать
    // нестабильность / лишнюю нагрузку; при необходимости верните и настройте провайдера.
    '@nuxt/image',
    '@nuxt/test-utils',
    'shadcn-nuxt',
  ],
  shadcn: {
    prefix: '',
    componentDir: '@/shared/ui',
  },

  image: {
    domains: ['api.dicebear.com'],
  },

  imports: {
    dirs: ['app/composables'],
  },

  runtimeConfig: {
    dadataApiKey: process.env.DADATA_API_KEY ?? '',
    dadataSecretKey: process.env.DADATA_SECRET_KEY ?? '',
  },

})
