<template>
  <AppHead>
    <title>Vue.js 3 Master Class Forum</title>
    <meta
      name="description"
      content="An awesome Vue.js 3 powered forum! qddd extra lines"
    />

    <!-- Social -->
    <meta property="og:title" content="Vue.js 3 Master Class Forum" />
    <meta
      property="og:description"
      content="An Awesome Vue.js 3 powered forum!"
    />
    <meta
      property="og:image"
      content="https://vueschool.io/media/f007f6057444d9a7f567163391d2b366/vuejs-3-master-class-not-transparent.jpg"
    />

    <!-- Twitter -->
    <meta name="twitter:title" content="Vue.js 3 Master Class Forum" />
    <meta
      name="twitter:description"
      content="An Awesome Vue.js 3 powered forum!"
    />
    <meta
      name="twitter:image"
      content="https://vueschool.io/media/f007f6057444d9a7f567163391d2b366/vuejs-3-master-class-not-transparent.jpg"
    />
    <meta name="twitter:card" content="summary_large_image" />
  </AppHead>
  <TheNavbar />
  <div class="container">
    <!-- The key property is unique and destroys component when navigated away & creates a new one  -->
    <!-- There is a simple way to tell the router-view, or any component, to update. Just bind the component key property to a reactive data source.  -->
    <router-view
      v-show="showPage"
      @ready="onPageReady"
      :key="$route.fullPath"
    />
    <AppSpinner v-show="!showPage" />
    <AppNotifications />
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavBar'
import { mapActions } from 'vuex'
import NProgress from 'nprogress'
import AppNotifications from '@/components/AppNotifications'

export default {
  name: 'App',
  components: { TheNavbar, AppNotifications },
  data() {
    return {
      showPage: false
    }
  },
  methods: {
    ...mapActions('auth', ['fetchAuthUser']),
    onPageReady() {
      this.showPage = true
      NProgress.done()
    }
  },
  created() {
    this.fetchAuthUser()
    NProgress.configure({
      speed: 200,
      showSpinner: false
    })
    this.$router.beforeEach(() => {
      this.showPage = false
      NProgress.start()
    })
  }
}
</script>

<style>
@import 'assets/style.css';
@import '~nprogress/nprogress.css';
#nprogress .bar {
  background: #57ad8d !important;
}
</style>
