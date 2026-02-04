import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CharacterDetail from '../views/CharacterDetail.vue'
import GraphView from '../views/GraphView.vue'
import CharactersView from '../views/CharactersView.vue'
import PlotView from '../views/PlotView.vue'
import FactionsView from '../views/FactionsView.vue'
import ForeshadowingView from '../views/ForeshadowingView.vue'
import ForeshadowingDetailView from '../views/ForeshadowingDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/character/:id',
      name: 'character-detail',
      component: CharacterDetail
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharactersView
    },
    {
      path: '/plot',
      name: 'plot',
      component: PlotView
    },
    {
      path: '/factions',
      name: 'factions',
      component: FactionsView
    },
    {
      path: '/foreshadowing',
      name: 'foreshadowing',
      component: ForeshadowingView
    },
    {
      path: '/foreshadowing/:id',
      name: 'foreshadowing-detail',
      component: ForeshadowingDetailView
    },
    {
      path: '/graph',
      name: 'graph',
      component: GraphView
    }
  ]
})

export default router
