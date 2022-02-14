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
    authId: 'jUjmgCurRRdzayqbRMO7aTG9X1G2'
  },
  getters,
  actions,
  mutations
})
