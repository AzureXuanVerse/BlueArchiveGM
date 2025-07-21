import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GiveAll from '../views/GiveAll.vue'
import GetPlayer from '../views/GetPlayer.vue'
import IdList from '../views/IdList.vue'
import Character from '../views/Character.vue'
import About from '../views/About.vue'
import GameSetting from '../views/GameSetting.vue'
import ConfigMaker from '../views/ConfigMaker.vue'
import Mail from '../views/Mail.vue'

import Account from '@/views/Account.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/GiveAll', name: 'GiveAll', component: GiveAll },
  { path: '/GetPlayer', name: 'GetPlayer', component: GetPlayer },
  { path: '/IdList', name: 'IdList', component: IdList },
  { path: '/Character', name: 'Character', component: Character },
  { path: '/About', name: 'About', component: About },
  { path: '/Setting', name: 'GameSetting', component: GameSetting },
  { path: '/ConfigMaker', name: 'ConfigMaker', component: ConfigMaker },
  { path: '/Mail', name: 'Mail', component: Mail },

  { path: '/Account', name: 'Account', component: Account },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
