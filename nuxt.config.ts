// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // One fixed local port so `npm run dev` never lands on 3000 (taken by another
  // project). Railway sets PORT itself, so production is unaffected.
  devServer: { port: Number(process.env.PORT) || 3100 },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || 'dev-only-insecure-secret',
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      // The site's public address for links in search results and shares,
      // e.g. https://yanarestaurants.com. Set NUXT_PUBLIC_SITE_URL once a
      // custom domain is live; until then the address in use is detected.
      siteUrl: ''
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'YANA Restaurant — Fire & Sea',
      meta: [
        { name: 'description', content: 'YANA — Pan-Asian × Peruvian fusion restaurant on Al Saadiyat Island, Abu Dhabi.' },
        { name: 'theme-color', content: '#0F1E2E' },
        // Google Search Console ownership check. Keep it, or the site is unverified.
        { name: 'google-site-verification', content: 'PbRYkHLN7ORgeqxghYbaxByiHgBcYQtkL8SeMj_4Ycg' },
        { property: 'og:site_name', content: 'YANA Restaurant' },
        { property: 'og:locale', content: 'en_AE' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,200;0,300;0,400;0,500;0,600;1,300;1,400&display=swap' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  }
})
