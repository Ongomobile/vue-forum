<template>
  <div class="col-full">
    <VeeForm @submit="save" :key="formKey">
      <AppFormField
        as="textarea"
        name="text"
        v-model="postCopy.text"
        rows="10"
        cols="30"
        rules="required"
      />

      <div class="btn-group">
        <button class="btn btn-ghost">Cancel</button>
        <button class="btn btn-blue" type="submit" name="Publish">
          {{ post.id ? 'Update Post' : 'Submit Post' }}
        </button>
      </div>
    </VeeForm>
  </div>
</template>

<script>
export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) }
  },
  data() {
    return {
      postCopy: { ...this.post },
      // This property is a hack to rerender component so error message does not show after submitting text in textarea
      formKey: Math.random()
    }
  },
  methods: {
    save() {
      this.$emit('save', { post: this.postCopy })
      this.postCopy.text = ''
      this.formKey = Math.random()
    }
  }
}
</script>

<style>
</style>
