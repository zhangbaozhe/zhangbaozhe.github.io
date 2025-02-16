// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import Publications from './Publications.vue'
import './style.css'

/** @type {import('vitepress').Theme} */
export default {
  Layout,
  // Publications,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}

