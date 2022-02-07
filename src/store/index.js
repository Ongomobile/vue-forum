import { createLogger, createStore } from 'vuex'
import sourceData from '@/data'
import { findById, upsert } from '@/helpers'
export default createStore({
  plugins: [createLogger()],
  state: {
    ...sourceData,
    authId: 'jUjmgCurRRdzayqbRMO7aTG9X1G2'
  },
  getters: {
    authUser: (state) => {
      const user = findById(state.users, state.authId)
      if (!user) return null

      return {
        ...user,

        // get is javascript keyword that in this case allows us to access as properties of the object
        // like authUser.posts etc
        get posts() {
          return state.posts.filter((post) => post.userId === user.id)
        },
        get postsCount() {
          return this.posts.length
        },
        get threads() {
          return state.threads.filter((thread) => thread.userId === user.id)
        },
        get threadsCount() {
          return this.threads.length
        }
      }
    }
  },
  actions: {
    createPost({ commit, state }, post) {
      post.id = 'qqqq' + Math.random()
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setPost', { post })
      commit('appendPostToThread', {
        postId: post.id,
        threadId: post.threadId
      })
    },
    updateUser({ commit }, user) {
      commit('setUser', { user, userId: user.id })
    },
    async createThread({ commit, state, dispatch }, { text, title, forumId }) {
      const id = 'qqqq' + Math.random()
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)
      const thread = { forumId, title, publishedAt, userId, id }
      commit('setThread', { thread })
      commit('appendThreadtoUser', { userId, threadId: id })
      commit('appendThreadtoForum', { forumId, threadId: id })
      dispatch('createPost', { text, threadId: id })
      return findById(state.threads, id)
    },
    async updateThread({ commit, state }, { title, text, id }) {
      const thread = findById(state.threads, id)
      const post = findById(state.posts, thread.posts[0])
      const newThread = { ...thread, title }
      const newPost = { ...post, text }
      commit('setThread', { thread: newThread })
      commit('setPost', { post: newPost })
      return newThread
    }
  },
  mutations: {
    setPost(state, { post }) {
      upsert(state.posts, post)
    },
    setThread(state, { thread }) {
      upsert(state.threads, thread)
    },
    setUser(state, { user, userId }) {
      const userIndex = state.users.findIndex((user) => user.id === userId)
      state.users[userIndex] = user
    },
    appendPostToThread(state, { postId, threadId }) {
      const thread = findById(state.threads, threadId)
      thread.posts = thread.posts || []
      thread.posts.push(postId)
    },
    appendThreadtoForum(state, { forumId, threadId }) {
      const forum = findById(state.forums, forumId)
      forum.threads = forum.posts || []
      forum.threads.push(threadId)
    },
    appendThreadtoUser(state, { userId, threadId }) {
      const user = findById(state.users, userId)
      user.threads = user.threads || []
      user.threads.push(threadId)
    }
  }
})
