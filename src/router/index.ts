import { createRouter, createWebHashHistory } from 'vue-router'
import HomeMainView from '@/views/main/index.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeMainView
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
