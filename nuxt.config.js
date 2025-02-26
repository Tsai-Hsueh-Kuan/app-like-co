const siteDefaultDescription =
  'Register an ISCN for your content, mark an immutable record on blockchain for better authenticity.'

const {
  IS_TESTNET,
  CI,
  GA_TRACKING_ID,
  SENTRY_DSN,
} = process.env;

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'ISCN App',
    meta: [
      { charset: 'utf-8' },
      { hid: 'viewport', name: 'viewport', content: 'width=device-width' },
      { hid: 'description', name: 'description', content: siteDefaultDescription },
      { hid: 'theme-color', name: 'theme-color', content: '#28646e' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'ISCN App'},
      { hid: 'og:title', property: 'og:title', content: 'ISCN App' },
      { hid: 'og:image', property: 'og:image', content: 'https://app.like.co/images/og/default.png' },
      { hid: 'og:description', property: 'og:description', content: siteDefaultDescription },
      { hid: 'og:image_alt', property: 'og:image:alt', content: '#DePub' },
      { hid: 'og:image_width', property: 'og:image:width', content: '1200' },
      { hid: 'og:image_height', property: 'og:image:height', content: '630' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=PT+Mono&display=swap' },
    ],
  },

  env: {
    IS_TESTNET,
    CI,
    GA_TRACKING_ID,
    SENTRY_DSN,
  },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/css/global.css'],

  render: {
    csp: {
      enabled: true,
      unsafeInlineCompatibility: true,
      hashAlgorithm: 'sha256',
      policies: {
        'default-src': [
          "'self'",
          'data:',
          'blob:',
          '*',
        ],
        'script-src': [
          "'self'",
          "'unsafe-inline'", // ignored by browser with sha support
          "'wasm-unsafe-eval'",
          "www.googletagmanager.com",
        ],
        'connect-src': [
          "'self'",
          'data:',
          '*',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'fonts.googleapis.com',
        ],
      },
    },
  },
  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{ src: '~/plugins/gtag.client.ts', mode: 'client' }],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',

    // https://i18n.nuxtjs.org
    '@nuxtjs/i18n',

    // https://sentry.nuxtjs.org
    '@nuxtjs/sentry',

    // https://portal-vue.linusb.org/guide/installation.html#nuxt-module
    'portal-vue/nuxt',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    browserBaseURL: '/api',
    retry: { retries: 1 },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  i18n: {
    locales: [{
        code: 'en',
        file: 'en.json',
      }],
    defaultLocale: 'en',
    langDir: '~/locales/',
    vuex: false,
  },

  sentry: {
    config: {
      ignoreErrors: ['WebAssembly.instantiate'],
    },
    clientIntegrations: {
      /* default integrations will still be added due to deep-merge */
      ReportingObserver: false, // reporting is very noisy on CSP violation.
    },
  },

  serverMiddleware: [{ path: '/api', handler: '~/server/index.ts' }],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
  server: {
    host: process.env.NODE_ENV === 'production' ? '0' : 'localhost',
  },
}
