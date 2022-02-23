import db from '@/main'
import {
  arrayUnion,
  serverTimestamp,
  writeBatch,
  doc,
  collection,
  increment,
  getDoc,
  updateDoc
} from 'firebase/firestore'
export default {
  namespaced: true,
  state: {
    items: []
  },

  getters: {},

  actions: {
    async createPost({ commit, state, rootState }, post) {
      post.userId = rootState.auth.authId
      post.publishedAt = serverTimestamp()
      const batch = writeBatch(db)
      const postRef = doc(collection(db, 'posts'))
      const userRef = doc(db, 'users', rootState.auth.authId)
      batch.set(postRef, post)
      batch.update(doc(db, 'threads', post.threadId), {
        posts: arrayUnion(postRef.id),
        contributors: arrayUnion(rootState.auth.authId)
      })
      batch.update(userRef, {
        postsCount: increment(1)
      })
      await batch.commit()
      const newPost = await getDoc(postRef)
      commit(
        'setItem',
        {
          resource: 'posts',
          item: { ...newPost.data(), id: newPost.id }
        },
        { root: true }
      )
      commit(
        'threads/appendPostToThread',
        {
          childId: newPost.id,
          parentId: post.threadId
        },
        { root: true }
      )
      commit(
        'threads/appendContributorToThread',
        {
          childId: rootState.auth.authId,
          parentId: post.threadId
        },
        { root: true }
      )
    },

    async updatePost({ commit, state, rootState }, { text, id }) {
      const post = {
        text,
        edited: {
          at: serverTimestamp(),
          by: rootState.auth.authId,
          moderated: false
        }
      }
      const postRef = doc(db, 'posts', id)
      await updateDoc(postRef, post)
      const updatedPost = await getDoc(postRef)
      commit(
        'setItem',
        { resource: 'posts', item: updatedPost },
        { root: true }
      )
    },

    fetchPost: ({ dispatch }, { id }) =>
      dispatch(
        'fetchItem',
        { emoji: '💬', resource: 'posts', id },
        { root: true }
      ),

    fetchPosts: ({ dispatch }, { ids }) =>
      dispatch(
        'fetchItems',
        { resource: 'posts', ids, emoji: '💬' },
        { root: true }
      )
  },

  mutations: {}
}
