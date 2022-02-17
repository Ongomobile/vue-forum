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
    authId: '7uVPJS9GHoftN58Z2MXCYDqmNAh2'
  },
  getters,
  actions,
  mutations
})
