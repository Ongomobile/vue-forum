<template>
  <h1 class="push-top">Welcome to the Forum</h1>
  <CategoryList :categories="categories" />
</template>

<script>
import CategoryList from '@/components/CategoryList'
export default {
  components: {
    CategoryList
  },
  computed: {
    categories() {
      return this.$store.state.categories
    }
  },
  beforeCreate() {
    // can not access or update any data
    console.log('before created', this.categories)
  },
  created() {
    // eslint-disable-next-line no-trailing-spaces
    //  triggered when instance created but before template
    //  is rendered in the dom can access data and computed properties
    // great time to fire ajax call because it has more time before dom is visable
    console.log('before created', this.categories)
  },
  beforeMount() {
    // componts template has been compiled & virtual dom updated computations are done here before rendering actual dom
    console.log('beforeMount', this.categories)
  },
  mounted() {
    // kinda like jquery ready and have access to dom elements
    console.log('mounted', this.categories, this.$el)
  },
  beforeUnmount() {
    // best place to turn off event listeners, the component is fully functional
    console.log('beforeUnmount', this.categories, this.$el)
  },
  unmounted() {
    // In most cases this hook is not needed
    console.log('unmounted', this.categories)
  }
}
</script>

<style scoped>
</style>
