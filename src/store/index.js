import { createLogger, createStore } from 'vuex'
import getters from '@/store/getters'
import actions from '@/store/actions'
import mutations from '@/store/mutations'

export default createStore({
  plugins: [createLogger()],
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    authId: null,
    unsubscribes: [],
    authUserUnsubscribe: null
  },
  getters,
  actions,
  mutations
})
