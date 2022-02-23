<template>
  <TheNavbar />

  <div class="container">
    <!-- The key property is unique and destroys component when navigated away & creates a new one  -->
    <!-- There is a simple way to tell the router-view, or any component, to update. Just bind the component key property to a reactive data source.  -->
    <router-view v-show="showPage" @ready="onPageReady" :key="$route.path" />
    <AppSpinner v-show="!showPage" />
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavBar'
import { mapActions } from 'vuex'
import NProgress from 'nprogress'

export default {
  name: 'App',
  components: { TheNavbar },
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
