<template>
  <div id="app">
    <!-- 引入公告弹窗组件 -->
    <AnnouncementModal ref="announcementModal" />
    <div class="container">
      <Sidebar v-show="!isMobile" />
      <div class="content" :class="{ 'mobile-content': isMobile }">
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
    <BottomNavBar />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import AnnouncementModal from './components/Announcement.vue'
import BottomNavBar from './components/BottomNavBar.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    AnnouncementModal,
    BottomNavBar
  },
  data() {
    return {
      isMobile: false
    }
  },
  mounted() {
    // 挂载后自动打开公告弹窗（可根据需求调整调用时机）
    this.$refs.announcementModal.open()
    
    // 检测设备类型
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  unmounted() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    }
  }
}
</script>

<style>
#app {
  background-image: url('@/assets/images/banner1.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* 完全移除所有遮罩相关样式 */
.container {
  display: flex;
  min-height: 100vh;
  background: transparent !important; /* 强制透明 */
}

.content {
  flex: 1;
  background: transparent !important;
  padding: 0;
}

.main-content {
  padding: 24px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .main-content {
    padding: 1px;
  }
}
</style>
