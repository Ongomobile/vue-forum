import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// import firebase from 'firebase/app'
import firebaseConfig from '@/config/firebase'
import { getAuth } from 'firebase/auth'
import FontAwesome from '@/plugins/FontAwesome'
// firebase.initializeApp(firebaseConfig)
const fbApp = initializeApp(firebaseConfig)
const db = getFirestore(fbApp)
const auth = getAuth()
auth.onAuthStateChanged((user) => {
  console.log({ user })
  if (user) {
    store.dispatch('fetchAuthUser')
  }
})
const forumApp = createApp(App)
forumApp.use(router)
forumApp.use(store)
forumApp.use(FontAwesome)

const requireComponent = require.context(
  './components',
  true,
  /App[A-Z]\w+\.(vue|js)$/
)
requireComponent.keys().forEach(function (fileName) {
  let baseComponentConfig = requireComponent(fileName)
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig
  const baseComponentName =
    baseComponentConfig.name ||
    fileName.replace(/^.+\//, '').replace(/\.\w+$/, '')
  forumApp.component(baseComponentName, baseComponentConfig)
})
/* add font awesome icon component */

forumApp.mount('#app')

export default db
