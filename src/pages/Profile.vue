<template>
  <div class="container" style="width: 100%">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <UserProfileCard v-if="!edit" :user="user" />
        <UserProfileCardEditor v-else :user="user" />
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead"> {{ user.username }} recent activity </span>
          <a href="#">See only started threads?</a>
        </div>

        <hr />

        <PostsList :posts="user.posts" />
      </div>
    </div>
  </div>
</template>

<script>
import PostsList from '@/components/PostsList'
import UserProfileCard from '@/components/UserProfileCard'
import UserProfileCardEditor from '@/components/UserProfileCardEditor'

import { mapGetters } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
export default {
  components: { PostsList, UserProfileCard, UserProfileCardEditor },
  mixins: [asyncDataStatus],
  props: {
    edit: { type: Boolean, default: false }
  },
  computed: {
    ...mapGetters('auth', { user: 'authUser' })
  },
  async created() {
    await this.$store.dispatch('auth/fetchAuthUsersPosts')
    this.asyncDataStatus_fetched()
  }
}
</script>

<style>
</style>
