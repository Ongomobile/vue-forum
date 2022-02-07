<template>
  <div class="container">
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
export default {
  components: { PostsList, UserProfileCard, UserProfileCardEditor },
  props: {
    edit: { type: Boolean, default: false }
  },
  computed: {
    ...mapGetters({ user: 'authUser' })
  }
}
</script>

<style>
</style>
