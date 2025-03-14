<template>
  <div id="app">
    <div class="container">
      <Sidebar />
      <div class="content">
        <TopNavBar />
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import TopNavBar from './components/TopNavBar.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    TopNavBar,
  },
}
</script>

<style>
#app {
  background-image: url('@/assets/banner1.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.container {
  display: flex;
  min-height: 100vh;
  background: transparent !important;
}

.content {
  flex: 1;
  background: transparent !important;
  padding: 0;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 24px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .content {
    margin-left: 64px;
    width: calc(100% - 64px);
  }

  .main-content {
    padding: 16px;
    margin-top: 30px; /* 为固定定位的顶部导航栏留出空间 */
  }
}
</style>