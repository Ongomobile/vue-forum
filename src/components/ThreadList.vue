<template>
  <div class="col-full">
    <div class="thread-list">
      <h2 class="list-title">Threads</h2>
      <div v-if="threads.length">
        <div v-for="thread in threads" :key="thread.id" class="thread">
          <div>
            <p>
              <router-link
                v-if="thread.id"
                :to="{ name: 'ThreadShow', params: { id: thread.id } }"
                >{{ thread.title }}</router-link
              >
            </p>
            <p class="text-faded text-xsmall">
              By
              <router-link :to="{ name: 'Profile' }">{{
                userById(thread.userId).name
              }}</router-link
              >, <AppDate :timestamp="thread.publishedAt" />.
            </p>
          </div>

          <div class="activity">
            <p class="replies-count">{{ thread.repliesCount }} replies</p>

            <AppAvatarImg
              class="avatar-medium"
              :src="userById(thread.userId).avatar"
            />

            <div>
              <p class="text-xsmall">
                <router-link :to="{ name: 'Profile' }">{{
                  userById(thread.userId).name
                }}</router-link>
              </p>
              <p class="text-xsmall text-faded">
                <AppDate :timestamp="thread.publishedAt" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!threads.lenght" style="padding: 10px; text-align: center">
      <em>No Threads Available</em>
    </div>
  </div>
</template>

<script>
import { findById } from '@/helpers'
export default {
  props: {
    threads: {
      type: Array,
      required: true
    }
  },
  computed: {
    posts() {
      return this.$store.state.posts.items
    },
    users() {
      return this.$store.state.users.items
    }
  },
  methods: {
    postById(postId) {
      return findById(this.posts, postId)
    },
    userById(userId) {
      return findById(this.users, userId) || {}
    }
  }
}
</script>

<style>
</style>
