import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as ElIcons from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles.css' // 自定义样式
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/documentation-tips.css'
import axios from 'axios'

// 添加响应拦截器，统一处理401错误
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      error.message = '老师！您貌似没有认证密钥哦，请检查首页认证密钥是否输入正确！'
    }
    return Promise.reject(error)
  },
)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElIcons)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')
