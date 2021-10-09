import { RouteRecordRaw } from 'vue-router/dist/vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Index', component: () => import('pages/Index.vue') },
      { path: 'emotes', name: 'Emote List', component: () => import('pages/Emotes.vue') },
      { path: 'mudae', name: 'Mudae Visualizer', component: () => import('pages/Mudae.vue') },
      { path: 'mangalist', name: 'Manga List', component: () => import('pages/MangaList.vue') },
      { path: 'mangareader/:redirect(.*)?', name: 'Manga Reader', component: () => import('pages/MangaReader.vue') },
      { path: 'mangaviewer', name: 'Manga Viewer', component: () => import('pages/MangaViewer.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
