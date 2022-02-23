import db from '@/main'
import { doc, collection, getDocs, query, where } from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

export default {
  namespaced: true,
  state: {
    authId: null,
    authUserUnsubscribe: null,
    authObserverUnsubscribe: null
  },

  getters: {
    authUser: (state, getters, rootState, rootGetters) => {
      return rootGetters['users/user'](state.authId)
    }
  },

  actions: {
    initAuthentication({ dispatch, commit, state }) {
      if (state.authObserverUnsubscribe) state.authObserverUnsubscribe()
      return new Promise((resolve) => {
        const auth = getAuth()
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          console.log('👣 the user has changed')
          this.dispatch('auth/unsubscribeAuthUserSnapshot')
          if (user) {
            await this.dispatch('auth/fetchAuthUser')
            resolve(user)
          } else {
            resolve(null)
          }
        })
        commit('setAuthObserverUnsubscribe', unsubscribe)
      })
    },
    async registerUserWithEmailAndPassword(
      { dispatch },
      { avatar = null, email, name, username, password }
    ) {
      const auth = getAuth()
      const result = await createUserWithEmailAndPassword(auth, email, password)

      await dispatch(
        'users/createUser',
        {
          id: result.user.uid,
          email,
          name,
          username,
          avatar
        },
        { root: true }
      )
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
        const userDoc = doc(db, 'users', user.uid)

        if (!userDoc.exists) {
          return dispatch(
            'users/createUser',
            {
              id: user.uid,
              name: user.displayName,
              email: user.email,
              username: user.email,
              avatar: user.photoURL
            },
            { root: true }
          )
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
    fetchAuthUser: async ({ dispatch, state, commit }) => {
      const auth = getAuth()
      const userId = auth.currentUser?.uid
      if (!userId) return

      await dispatch(
        'fetchItem',
        {
          emoji: '🙋',
          resource: 'users',
          id: userId,
          handleUnsubscribe: (unsubscribe) => {
            commit('setAuthUserUnsubscribe', unsubscribe)
          }
        },
        { root: true }
      )

      commit('setAuthId', userId)
    },
    async fetchAuthUsersPosts({ commit, state }) {
      const posts = query(
        collection(db, 'posts'),
        where('userId', '==', state.authId)
      )

      const querySnapshot = await getDocs(posts)
      querySnapshot.forEach((item) => {
        commit('setItem', { resource: 'posts', item }, { root: true })
      })
    },
    async unsubscribeAuthUserSnapshot({ state, commit }) {
      if (state.authUserUnsubscribe) {
        state.authUserUnsubscribe()
        commit('setAuthUserUnsubscribe', null)
      }
    }
  },

  mutations: {
    setAuthId(state, id) {
      state.authId = id
    },
    setAuthUserUnsubscribe(state, unsubscribe) {
      state.authUserUnsubscribe = unsubscribe
    },
    setAuthObserverUnsubscribe(state, unsubscribe) {
      state.authObserverUnsubscribe = unsubscribe
    }
  }
}