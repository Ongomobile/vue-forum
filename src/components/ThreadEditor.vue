<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <label for="thread_title">Title:</label>
      <input
        v-model="form.title"
        type="text"
        id="thread_title"
        class="form-input"
        name="title"
      />
    </div>

    <div class="form-group">
      <label for="thread_content">Content:</label>
      <textarea
        v-model="form.text"
        id="thread_content"
        class="form-input"
        name="content"
        rows="8"
        cols="140"
      ></textarea>
    </div>

    <div class="btn-group">
      <button @click="$emit('cancel')" class="btn btn-ghost">Cancel</button>
      <button class="btn btn-blue" type="submit" name="Publish">
        {{ existing ? 'Update' : 'Publish' }}
      </button>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
    text: { type: String, default: '' }
  },
  data() {
    return {
      form: {
        title: this.title,
        text: this.text
      }
    }
  },
  computed: {
    existing() {
      // !! convers variable into boolean
      return !!this.title
    }
  },
  methods: {
    save() {
      this.$emit('clean')
      this.$emit('save', { ...this.form })
    }
  },
  watch: {
    form: {
      handler() {
        // This line checks if anything other than passed props
        if (this.form.title !== this.title || this.form.text !== this.text) {
          // dirty indicates a form has un saved changes
          this.$emit('dirty')
        } else {
          // this checks to see if form has no unsaved changes
          this.$emit('clean')
        }
      },
      deep: true
    }
  }
}
</script>

<style>
</style>
