<template>
  <h1>Welcome to the Forum</h1>
  <CategoryList :categories="categories" />
</template>

<script>
import sourceData from '@/data.json'
import CategoryList from '@/components/CategoryList'
export default {
  components: {
    CategoryList
  },
  data() {
    return {
      categories: sourceData.categories
    }
  }
}
</script>

<style scoped>
</style>
