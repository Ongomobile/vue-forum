import { createLogger, createStore } from 'vuex'
import { findById, upsert } from '@/helpers'
import firebase from 'firebase/compat'

export default createStore({
  plugins: [createLogger()],
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    authId: 'jUjmgCurRRdzayqbRMO7aTG9X1G2'
  },
  getters: {
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
    thread: (state) => {
      return (id) => {
        const thread = findById(state.threads, id)
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
            return thread.contributors.length
          }
        }
      }
    }
  },
  actions: {
    createPost({ commit, state }, post) {
      post.id = 'qqqq' + Math.random()
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setItem', { resource: 'posts', item: post })
      commit('appendPostToThread', {
        childId: post.id,
        parentId: post.threadId
      })
      commit('appendContributorToThread', {
        childId: state.authId,
        parentId: post.threadId
      })
    },

    async createThread({ commit, state, dispatch }, { text, title, forumId }) {
      const id = 'qqqq' + Math.random()
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)
      const thread = { forumId, title, publishedAt, userId, id }
      commit('setItem', { resource: 'threads', item: thread })
      commit('appendThreadtoUser', { parentId: userId, childId: id })
      commit('appendThreadtoForum', { parentId: forumId, childId: id })
      dispatch('createPost', { text, threadId: id })
      return findById(state.threads, id)
    },

    async updateThread({ commit, state }, { title, text, id }) {
      const thread = findById(state.threads, id)
      const post = findById(state.posts, thread.posts[0])
      const newThread = { ...thread, title }
      const newPost = { ...post, text }
      commit('setItem', { resource: 'threads', item: newThread })
      commit('setItem', { resource: 'posts', item: newPost })
      return newThread
    },

    updateUser({ commit }, user) {
      commit('setItem', { resource: 'users', item: user })
    },

    fetchThread({ dispatch }, { id }) {
      return this.dispatch('fetchItem', {
        resource: 'threads',
        id,
        emoji: '📄'
      })
    },

    fetchUser({ dispatch }, { id }) {
      return this.dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' })
    },

    fetchPost({ dispatch }, { id }) {
      return this.dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' })
    },
    fetchThreads({ dispatch }, { ids }) {
      return dispatch('fetchItems', { resource: 'threads', ids, emoji: '📄' })
    },

    fetchUsers({ dispatch }, { ids }) {
      return dispatch('fetchItems', { resource: 'users', ids, emoji: '🙋' })
    },

    fetchPosts({ dispatch }, { ids }) {
      return dispatch('fetchItems', { resource: 'posts', ids, emoji: '💬' })
    },

    fetchItem({ state, commit }, { id, emoji, resource }) {
      console.log('🔥', emoji, id)
      return new Promise((resolve) => {
        firebase
          .firestore()
          .collection(resource)
          .doc(id)
          .onSnapshot((doc) => {
            const item = { ...doc.data(), id: doc.id }
            commit('setItem', { resource, id, item })
            resolve(item)
          })
      })
    },
    fetchItems({ dispatch }, { ids, resource, emoji }) {
      return Promise.all(
        ids.map((id) => dispatch('fetchItem', { id, resource, emoji }))
      )
    }
  },
  mutations: {
    setItem(state, { resource, item }) {
      upsert(state[resource], item)
    },
    appendPostToThread: makeAppendChildToParrentMutation({
      parent: 'threads',
      child: 'posts'
    }),

    appendThreadtoForum: makeAppendChildToParrentMutation({
      parent: 'forums',
      child: 'threads'
    }),
    appendThreadtoUser: makeAppendChildToParrentMutation({
      parent: 'users',
      child: 'threads'
    }),
    appendContributorToThread: makeAppendChildToParrentMutation({
      parent: 'threads',
      child: 'contributors'
    })
  }
})

// Higher order function for mutations must be a regular function because of scope functions are hoisted
function makeAppendChildToParrentMutation({ parent, child }) {
  return (state, { childId, parentId }) => {
    const resource = findById(state[parent], parentId)
    resource[child] = resource[child] || []
    if (!resource[child].includes(childId)) {
      resource[child].push(childId)
    }
  }
}
