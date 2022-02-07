<template>
  <TheNavbar />
  <div class="container">
    <router-view />
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavBar'
export default {
  name: 'App',
  components: { TheNavbar }
}
</script>

<style>
@import 'assets/style.css';
</style>
