<template>
  <div class="post-list">
    <div class="post" v-for="post in posts" :key="post.id">
      <div v-if="userById(post.userId)" class="user-info">
        <router-link :to="{ name: 'Profile' }" class="user-name">{{
          userById(post.userId).name
        }}</router-link>

        <router-link :to="{ name: 'Profile' }">
          <AppAvatarImg
            class="avatar-large"
            :src="userById(post.userId).avatar"
            alt=""
          />
        </router-link>

        <p class="desktop-only text-small">
          {{ userById(post.userId).postsCount }}
          posts
        </p>
        <p class="desktop-only text-small">
          {{ userById(post.userId).threadsCount }}
          threads
        </p>
      </div>
      <div class="post-content">
        <div class="col-full">
          <PostEditor
            v-if="editing === post.id"
            :post="post"
            @save="handleUpdate"
          />
          <p v-else>
            {{ post.text }}
          </p>
        </div>
        <a
          v-if="post.userId === $store.state.auth.authId"
          @click.prevent="toggleEditMode(post.id)"
          href="#"
          style="margin-left: auto; padding-left: 10px"
          class="link-unstyled"
          title="Make a change"
        >
          <fa icon="pencil-alt" />
        </a>
      </div>

      <div class="post-date text-faded">
        <div class="edition-info" v-if="post.edited?.at">edited</div>
        <AppDate :timestamp="post.publishedAt" />
      </div>
    </div>
  </div>
</template>

<script>
import PostEditor from '@/components/PostEditor'
import { mapActions } from 'vuex'
export default {
  components: {
    PostEditor
  },
  props: {
    posts: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      editing: null
    }
  },
  computed: {
    users() {
      return this.$store.state.users.items
    }
  },
  methods: {
    ...mapActions('posts', ['updatePost']),
    userById(userId) {
      return this.$store.getters['users/user'](userId)
    },
    toggleEditMode(id) {
      this.editing = id === this.editing ? null : id
    },
    handleUpdate(event) {
      this.updatePost(event.post)
      this.editing = null
    }
  }
}
</script>

<style>
</style>
