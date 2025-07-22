<template>
  <div class="top-navbar">
    <div class="navbar-content">
      <!-- GitHub 按钮放置在右侧 -->
      <GithubButton />
    </div>
  </div>
</template>

<script>
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
  background-color: rgba(255, 255, 255, 0.47); /* 白色半透明 */
  padding: 10px 20px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}
.navbar-content {
  width: 100%;
  display: flex;
  justify-content: flex-end; /* 按钮靠右 */
  align-items: center;
}
</style>
