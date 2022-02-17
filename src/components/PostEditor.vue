<template>
  <div class="col-full">
    <form @submit.prevent="save">
      <div class="form-group">
        <label for="thread_content">Reply:</label>
        <textarea
          v-model="postCopy.text"
          id="thread_content"
          class="form-input"
          name="content"
          rows="8"
          cols="140"
        ></textarea>
      </div>

      <div class="btn-group">
        <button class="btn btn-ghost">Cancel</button>
        <button class="btn btn-blue" type="submit" name="Publish">
          {{ post.id ? 'Update Post' : 'Submit Post' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) }
  },
  data() {
    return {
      postCopy: { ...this.post }
    }
  },
  methods: {
    save() {
      this.$emit('save', { post: this.postCopy })
      this.postCopy.text = ''
    }
  }
}
</script>

<style>
</style>
