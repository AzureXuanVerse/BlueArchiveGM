<template>
  <div class="top-navbar">
    <div class="navbar-content">
      <GithubButton />
    </div>
  </div>
</template>

<script>
import GithubButton from './GithubButton.vue'
export default {
  name: 'TopNavBar',
  components: {
    GithubButton,
  },
}
</script>

<style scoped>
.top-navbar {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.47);
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 99;
}

.navbar-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 移动端样式 */
@media screen and (max-width: 768px) {
  .top-navbar {
    position: fixed;
    top: 0;
    left: 64px; /* 与收起的侧边栏宽度对应 */
    width: calc(100% - 64px);
    padding: 10px 20px;
  }
}
</style>