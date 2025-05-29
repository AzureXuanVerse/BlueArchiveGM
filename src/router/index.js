import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Give from '../views/Give.vue'
import GiveAll from '../views/GiveAll.vue'
import GetPlayer from '../views/GetPlayer.vue'
import Mail from '../views/Mail.vue'
import IdList from '../views/IdList.vue'
import Character from '../views/Character.vue'
import About from '../views/About.vue'
import GameSetting from '../views/GameSetting.vue'
import Account from '../views/Account.vue'
import SystemMail from '../views/SystemMail.vue'
import EmailCodeManager from '../views/EmailCodeManager.vue'
// 新增合并邮件管理页面
import MailManager from '../views/MailManager.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/give', name: 'Give', component: Give },
  { path: '/give-all', name: 'GiveAll', component: GiveAll },
  { path: '/get-player', name: 'GetPlayer', component: GetPlayer },
  { path: '/mail', name: 'Mail', component: Mail },
  // 重定向获取邮箱验证码到验证码管理页面，保持向后兼容性
  { path: '/get-email-code', redirect: '/email-code-manager' },
  { path: '/id-list', name: 'IdList', component: IdList },
  { path: '/character', name: 'Character', component: Character },
  { path: '/about', name: 'About', component: About },
  { path: '/setting', name: 'GameSetting', component: GameSetting },
  { path: '/account', name: 'Account', component: Account },
  { path: '/system-mail', name: 'SystemMail', component: SystemMail },
  { path: '/email-code-manager', name: 'EmailCodeManager', component: EmailCodeManager },
  { path: '/mail-manager', name: 'MailManager', component: MailManager },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
