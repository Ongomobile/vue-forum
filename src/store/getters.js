import { findById } from '@/helpers'

export default {
  authUser: (state, getters) => {
    return getters.user(state.authId)
  },
  user: (state) => {
    return (id) => {
      const user = findById(state.users, id)
      if (!user) return null

      return {
        ...user,

        // get is javascript keyword that in this case allows us to access as properties of the object
        // like authUser.posts etc
        get posts() {
          return state.posts.filter((post) => post.userId === user.id)
        },
        get postsCount() {
          return user.postsCount || 0
        },
        get threads() {
          return state.threads.filter((thread) => thread.userId === user.id)
        },
        get threadsCount() {
          return user.threads?.length || 0
        }
      }
    }
  },
  thread: (state) => {
    return (id) => {
      const thread = findById(state.threads, id)
      if (!thread) return {}
      return {
        ...thread,
        get author() {
          return findById(state.users, thread.userId)
        },
        get repliesCount() {
          // subtract first post
          return thread.posts.length - 1
        },
        get contributorsCount() {
          if (!thread.contributors) return 0
          return thread.contributors.length
        }
      }
    }
  }
}
