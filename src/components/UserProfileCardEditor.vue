<template>
  <div class="profile-card">
    <VeeForm @submit="save">
      <p class="text-center avatar-edit">
        <label for="avatar" style="cursor: pointer">
          <AppAvatarImg
            :src="activeUser.avatar"
            :alt="`${user.name} profile picture`"
            class="avatar-xlarge img-update"
          />
          <div class="avatar-upload-overlay">
            <AppSpinner v-if="uploadingImage" color="white" />
            <fa
              v-else
              icon="camera"
              size="3x"
              :style="{ color: 'white', opacity: '.8' }"
            />
          </div>
          <input
            v-show="false"
            type="file"
            id="avatar"
            accept="image/*"
            @change="handleAvatarUpload"
          />
        </label>
      </p>
      <UserProfileCardEditorRandomAvatar @hit="activeUser.avatar = $event" />
      <AppFormField
        label="Username"
        name="username"
        v-model="activeUser.username"
        :rules="`required|unique:users,username,${user.username}`"
      />
      <AppFormField
        label="Full Name"
        name="name"
        v-model="activeUser.name"
        rules="required"
      />
      <AppFormField
        label="Bio"
        name="bio"
        as="textarea"
        v-model="activeUser.bio"
        placeholder="Write a few words about yourself."
      />

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr />

      <AppFormField
        label="Website"
        name="website"
        v-model="activeUser.website"
        rules="url"
      />
      <AppFormField
        label="Email"
        name="email"
        v-model="activeUser.email"
        :rules="`required|email|unique:users,email,${user.email}`"
      />
      <AppFormField
        label="Location"
        name="location"
        v-model="activeUser.location"
        list="locations"
        @mouseenter="loadLocationOptions"
      />
      <datalist id="locations">
        <option
          v-for="location in locationOptions"
          :value="location.name.common"
          :key="location.name.common"
        />
      </datalist>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </VeeForm>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import UserProfileCardEditorRandomAvatar from './UserProfileCardEditorRandomAvatar'
export default {
  data() {
    return {
      // We need to clone user object using spread operator so we are not mutating the refferenced user object directly
      // this way the activeUser object is unique. Objects are passed by refference so be careful not to mutate the wrong object.
      // When setting objects to a variable always clone so not to mutate original object.
      activeUser: { ...this.user },
      uploadingImage: false,
      locationOptions: []
    }
  },
  components: { UserProfileCardEditorRandomAvatar },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('auth', ['uploadAvatar']),
    async loadLocationOptions() {
      if (this.locationOptions.length) return
      const res = await fetch('https://restcountries.com/v3/all')
      this.locationOptions = await res.json()
    },
    async handleAvatarUpload(e) {
      this.uploadingImage = true
      const file = e.target.files[0]
      const uploadedImage = await this.uploadAvatar({ file })
      this.activeUser.avatar = uploadedImage || this.activeUser.avatar
      this.uploadingImage = false
    },
    async handleRandomAvatarUpload() {
      const randomAvatarGenerated =
        this.activeUser.avatar.startsWith('https://pixabay')
      if (randomAvatarGenerated) {
        const image = await fetch(this.activeUser.avatar)
        const blob = await image.blob()
        this.activeUser.avatar = await this.uploadAvatar({
          file: blob,
          filename: 'random'
        })
      }
    },
    async save() {
      await this.handleRandomAvatarUpload()
      // We need to clone user object using spread operator so our changes only affect the current change and not the previous state
      this.$store.dispatch('users/updateUser', {
        ...this.activeUser,
        threads: this.activeUser.threadIds
      })
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
