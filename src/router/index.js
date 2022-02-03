import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import ThreadShow from '@/pages/ThreadShow'
import NotFound from '@/pages/NotFound'
import Forum from '@/pages/Forum'
import Category from '@/pages/Category'
import sourceData from '@/data.json'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Category,
    props: true
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    component: Forum,
    props: true
  },
  {
    path: '/thread/:id',
    name: 'ThreadShow',
    component: ThreadShow,
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
          // Preserve query & existing hash
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
