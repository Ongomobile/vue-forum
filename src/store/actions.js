// import firebase from 'firebase/compat'
import db from '@/main'
import * as firestore from 'firebase/firestore'
import { findById } from '@/helpers'
export default {
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
  // ---------------------------------------
  // Fetch Single Resource
  // ---------------------------------------
  fetchCategory: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { emoji: '🏷', resource: 'categories', id }),
  fetchForum: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { emoji: '🏁', resource: 'forums', id }),
  fetchThread: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { emoji: '📄', resource: 'threads', id }),
  fetchPost: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { emoji: '💬', resource: 'posts', id }),
  fetchUser: ({ dispatch }, { id }) =>
    dispatch('fetchItem', { emoji: '🙋', resource: 'users', id }),
  fetchAuthUser: ({ dispatch, state }) =>
    dispatch('fetchItem', { emoji: '🙋', resource: 'users', id: state.authId }),

  // ---------------------------------------
  // Fetch All of a Resource
  // ---------------------------------------

  fetchAllCategories({ commit }) {
    console.log('🔥', '🏷', 'all')
    return new Promise((resolve) => {
      firestore
        .getDocs(firestore.collection(db, 'categories'))
        .then((querySnapshot) => {
          const categories = querySnapshot.docs.map((doc) => {
            const item = { id: doc.id, ...doc.data() }
            commit('setItem', { resource: 'categories', item })
            return item
          })
          resolve(categories)
        })
    })
  },

  // ---------------------------------------
  // Fetch Multiple Resources
  // ---------------------------------------
  fetchCategories: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'categories', ids, emoji: '🏷' }),
  fetchForums: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'forums', ids, emoji: '🏁' }),
  fetchThreads: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'threads', ids, emoji: '📄' }),
  fetchPosts: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'posts', ids, emoji: '💬' }),
  fetchUsers: ({ dispatch }, { ids }) =>
    dispatch('fetchItems', { resource: 'users', ids, emoji: '🙋' }),

  fetchItem({ state, commit }, { id, emoji, resource }) {
    return new Promise((resolve) => {
      const docRef = firestore.doc(db, resource, id)
      firestore.getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const item = { ...docSnap.data(), id: docSnap.id }
          commit('setItem', { resource, id, item })
          resolve(item)
        }
      })
    })
  },

  fetchItems({ dispatch }, { ids, resource, emoji }) {
    console.log({ ids })
    return Promise.all(
      ids.map((id) => dispatch('fetchItem', { id, resource, emoji }))
    )
  }
}
