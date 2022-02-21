// import firebase from 'firebase/compat'
import db from '@/main'
import * as firestore from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

import { findById, docToResource } from '@/helpers'

export default {
  initAuthentication({ dispatch, commit, state }) {
    if (state.authObserverUnsubscribe) return
    return new Promise((resolve) => {
      const auth = getAuth()
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log('👣 the user has changed')
        this.dispatch('unsubscribeAuthUserSnapshot')
        if (user) {
          await this.dispatch('fetchAuthUser')
          resolve(user)
        } else {
          resolve(null)
        }
      })
      commit('setAuthObserverUnsubscribe', unsubscribe)
    })
  },
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

  async registerUserWithEmailAndPassword(
    { dispatch },
    { avatar = null, email, name, username, password }
  ) {
    const auth = getAuth()
    const result = await createUserWithEmailAndPassword(auth, email, password)

    await dispatch('createUser', {
      id: result.user.uid,
      email,
      name,
      username,
      avatar
    })
  },

  signInWithEmailAndPassword(context, { email, password }) {
    console.log(email, password)
    const auth = getAuth()
    return signInWithEmailAndPassword(auth, email, password)
  },
  async signInWithGoogle({ dispatch }) {
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const response = await signInWithPopup(auth, provider)
      const user = response.user
      const userDoc = firestore.doc(db, 'users', user.uid)

      if (!userDoc.exists) {
        return dispatch('createUser', {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          username: user.email,
          avatar: user.photoURL
        })
      }
    } catch (error) {
      alert(error.message)
    }
  },
  async signOut({ commit }) {
    const auth = getAuth()
    await auth.signOut()
    commit('setAuthId', null)
  },
  async createUser({ commit }, { id, email, name, username, avatar = null }) {
    const registeredAt = firestore.serverTimestamp()
    const usernameLower = username.toLowerCase()
    email = email.toLowerCase()
    const user = { avatar, email, name, username, usernameLower, registeredAt }
    const userRef = firestore.doc(db, 'users', id)
    await firestore.setDoc(userRef, user)

    const newUser = await firestore.getDoc(userRef)

    commit('setItem', { resource: 'users', item: newUser })
    return docToResource(newUser)
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
  fetchAuthUser: async ({ dispatch, state, commit }) => {
    const auth = getAuth()
    const userId = auth.currentUser?.uid
    if (!userId) return

    await dispatch('fetchItem', {
      emoji: '🙋',
      resource: 'users',
      id: userId,
      handleUnsubscribe: (unsubscribe) => {
        commit('setAuthUserUnsubscribe', unsubscribe)
      }
    })

    commit('setAuthId', userId)
  },

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

  fetchItem(
    { state, commit },
    { id, emoji, resource, handleUnsubscribe = null }
  ) {
    return new Promise((resolve) => {
      const docRef = firestore.doc(db, resource, id)
      const unsubscribe = firestore.onSnapshot(docRef, (doc) => {
        const item = { ...doc.data(), id: doc.id }
        commit('setItem', { resource, item })
        resolve(item)
      })
      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe)
      } else {
        commit('appendUnsubscribe', { unsubscribe })
      }
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
  },
  async unsubscribeAuthUserSnapshot({ state, commit }) {
    if (state.authUserUnsubscribe) {
      state.authUserUnsubscribe()
      commit('setAuthUserUnsubscribe', null)
    }
  }
}
