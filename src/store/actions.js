// import firebase from 'firebase/compat'
import db from '@/main'
import * as firestore from 'firebase/firestore'
import { findById, docToResource } from '@/helpers'
export default {
  async createPost({ commit, state }, post) {
    post.userId = state.authId
    post.publishedAt = firestore.serverTimestamp()
    const batch = firestore.writeBatch(db)
    const postRef = firestore.doc(firestore.collection(db, 'posts'))
    const userRef = firestore.doc(db, 'users', state.authId)
    batch.set(postRef, post)
    batch.update(firestore.doc(db, 'threads', post.threadId), {
      posts: firestore.arrayUnion(postRef.id),
      contributors: firestore.arrayUnion(state.authId)
    })
    batch.update(userRef, {
      postsCount: firestore.increment(1)
    })
    await batch.commit()
    const newPost = await firestore.getDoc(postRef)
    commit('setItem', {
      resource: 'posts',
      item: { ...newPost.data(), id: newPost.id }
    })
    commit('appendPostToThread', {
      childId: newPost.id,
      parentId: post.threadId
    })
    commit('appendContributorToThread', {
      childId: state.authId,
      parentId: post.threadId
    })
  },

  async updatePost({ commit, state }, { text, id }) {
    const post = {
      text,
      edited: {
        at: firestore.serverTimestamp(),
        by: state.authId,
        moderated: false
      }
    }
    const postRef = firestore.doc(db, 'posts', id)
    await firestore.updateDoc(postRef, post)
    const updatedPost = await firestore.getDoc(postRef)
    commit('setItem', { resource: 'posts', item: updatedPost })
  },
  async createThread({ commit, state, dispatch }, { text, title, forumId }) {
    const userId = state.authId
    const publishedAt = firestore.serverTimestamp()
    const threadRef = firestore.doc(firestore.collection(db, 'threads'))
    const thread = { forumId, title, publishedAt, userId, id: threadRef.id }
    const userRef = firestore.doc(db, 'users', userId)
    const forumRef = firestore.doc(db, 'forums', forumId)
    const batch = firestore.writeBatch(db)
    batch.set(threadRef, thread)
    batch.update(userRef, {
      threads: firestore.arrayUnion(threadRef.id)
    })
    batch.update(forumRef, {
      threads: firestore.arrayUnion(threadRef.id)
    })

    await batch.commit()
    const newThread = await firestore.getDoc(threadRef)

    commit('setItem', {
      resource: 'threads',
      item: { ...newThread.data(), id: newThread.id }
    })
    commit('appendThreadtoUser', { parentId: userId, childId: newThread.id })
    commit('appendThreadtoForum', { parentId: forumId, childId: newThread.id })
    await dispatch('createPost', { text, threadId: newThread.id })
    return findById(state.threads, newThread.id)
  },

  async updateThread({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id)
    const post = findById(state.posts, thread.posts[0])
    let newThread = { ...thread, title }
    let newPost = { ...post, text }
    const threadRef = firestore.doc(db, 'threads', id)
    const postRef = firestore.doc(db, 'posts', post.id)
    const batch = firestore.writeBatch(db)

    batch.update(threadRef, newThread)
    batch.update(postRef, newPost)
    await batch.commit()

    newThread = await firestore.getDoc(threadRef)
    newPost = await firestore.getDoc(postRef)

    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return docToResource(newThread)
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
      const unsubscribe = firestore.onSnapshot(docRef, (doc) => {
        const item = { ...doc.data(), id: doc.id }
        commit('setItem', { resource, item })
        resolve(item)
      })
      commit('appendUnsubscribe', { unsubscribe })
    })
  },

  fetchItems({ dispatch }, { ids, resource, emoji }) {
    return Promise.all(
      ids.map((id) => dispatch('fetchItem', { id, resource, emoji }))
    )
  },

  async unsubscribeAllSnapshots({ state, commit }) {
    state.unsubscribes.forEach((unsubscribe) => unsubscribe())
    commit('clearAllUnsubscribes')
  }
}
