import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Thread from '@/pages/Thread.vue'
import NotFound from '@/pages/NotFound.vue'
import sourceData from '@/data.json'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/thread/:id',
    name: 'Thread',
    component: Thread,
    props: true,
    // Route guard
    beforeEnter(to, from, next) {
      // Check if thread exists
      const threadExists = sourceData.threads.find(
        (thread) => thread.id === to.params.id
      )
      // If exist continue
      if (threadExists) {
        return next()
      } else {
        next({
          name: 'NotFound',
          params: { pathMatch: to.path.split('/').slice(1) },
          query: to.query,
          hash: to.hash
        })
      }
      // Else redirect to not found page
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

export default createRouter({
  // This is how you name the active classs to style. The default class name is router-link-active
  linkActiveClass: 'active-link',
  history: createWebHistory(),
  routes
})
