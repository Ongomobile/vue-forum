<template>
  <div class="profile-card">
    <form @submit.prevent="save">
      <p class="text-center">
        <label for="avatar" style="cursor: pointer">
          <img
            :src="user.avatar"
            :alt="`${user.name} profile picture`"
            class="avatar-xlarge img-update"
          />
          <input
            v-show="false"
            type="file"
            id="avatar"
            accept="image/*"
            @change="handleAvatarUpload"
          />
        </label>
      </p>

      <div class="form-group">
        <input
          v-model="activeUser.username"
          type="text"
          placeholder="Username"
          class="form-input text-lead text-bold"
        />
      </div>

      <div class="form-group">
        <input
          v-model="activeUser.name"
          type="text"
          placeholder="Full Name"
          class="form-input text-lead"
        />
      </div>

      <div class="form-group">
        <label for="user_bio">Bio</label>
        <textarea
          v-model="activeUser.bio"
          class="form-input"
          id="user_bio"
          placeholder="Write a few words about yourself."
        ></textarea>
      </div>

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr />

      <div class="form-group">
        <label class="form-label" for="user_website">Website</label>
        <input
          v-model="activeUser.website"
          autocomplete="off"
          class="form-input"
          id="user_website"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="user_email">Email</label>
        <input
          v-model="activeUser.email"
          autocomplete="off"
          class="form-input"
          id="user_email"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="user_location">Location</label>
        <input
          v-model="activeUser.location"
          autocomplete="off"
          class="form-input"
          id="user_location"
        />
      </div>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      // We need to clone user object using spread operator so we are not mutating the refferenced user object directly
      // this way the activeUser object is unique. Objects are passed by refference so be careful not to mutate the wrong object.
      // When setting objects to a variable always clone so not to mutate original object.
      activeUser: { ...this.user }
    }
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('auth', ['uploadAvatar']),
    async handleAvatarUpload(e) {
      const file = e.target.files[0]
      this.activeUser.avatar = await this.uploadAvatar({ file })
    },
    save() {
      // We need to clone user object using spread operator so our changes only affect the current change and not the previous state
      this.$store.dispatch('users/updateUser', { ...this.activeUser })
      this.$router.push({ name: 'Profile' })
    },
    cancel() {
      this.$router.push({ name: 'Profile' })
    }
  }
}
</script>

<style>
</style>
