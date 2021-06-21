import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Index', component: () => import('pages/Index.vue') },
      { path: 'emotes', name: 'Emote List', component: () => import('pages/Emotes.vue') },
      { path: 'mudae', name: 'Mudae Visualizer', component: () => import('pages/Mudae.vue') },
      { path: 'mangalist', name: 'Manga List', component: () => import('pages/Manga.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
