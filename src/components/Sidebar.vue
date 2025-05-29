<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <div class="logo-wrapper">
        <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
      </div>
      <el-menu
        class="el-menu-vertical-demo"
        :default-active="$route.path"
        router
        background-color="transparent"
        text-color="#000000"
        active-text-color="#1E90FF"
      >
        <el-menu-item index="/" class="menu-item">
          <i class="bi bi-house-door"></i> S.C.H.A.L.E 首页
        </el-menu-item>
        <el-menu-item index="/account" class="menu-item">
          <i class="bi bi-person-circle"></i> 账户管理
        </el-menu-item>
        <el-menu-item index="/give" class="menu-item">
          <i class="bi bi-gift"></i> 给予物品
        </el-menu-item>
        <el-menu-item index="/give-all" class="menu-item">
          <i class="bi bi-gift-fill"></i> 给予全部物品
        </el-menu-item>
        <el-menu-item index="/character" class="menu-item">
          <i class="bi bi-person-gear"></i> 设置学生数值
        </el-menu-item>
        <el-menu-item index="/mail-manager" class="menu-item">
          <i class="bi bi-envelope"></i> 邮件管理
        </el-menu-item>
        <el-menu-item index="/email-code-manager" class="menu-item">
          <i class="bi bi-shield-lock"></i> 验证码管理
        </el-menu-item>
        <el-menu-item index="/get-player" class="menu-item">
          <i class="bi bi-person"></i> 获取老师信息
        </el-menu-item>
        <el-menu-item index="/setting" class="menu-item">
          <i class="bi bi-gear"></i> S.C.H.A.L.E 设置
        </el-menu-item>
        <el-menu-item index="/id-list" class="menu-item">
          <i class="bi bi-list-nested"></i> 获取物品列表
        </el-menu-item>
        <el-menu-item index="/about" class="menu-item">
          <i class="bi bi-info-circle"></i> 关于
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
}
</script>

<style scoped>
/* 外层侧边栏半透明 */
.sidebar {
  width: 220px;
  min-height: 100vh;
  position: relative;
  background-color: rgba(255, 255, 255, 0.47); /* 半透明背景 */
  backdrop-filter: blur(10px); /* 模糊效果 */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow: visible !important;
}

/* LOGO区域 */
.logo-wrapper {
  text-align: center;
  padding: 20px 0;
  /* border-bottom: 1px solid rgba(240, 240, 240, 0.7); */
}

.sidebar-logo {
  width: 200px;
  height: auto;
}

/* 菜单区域 */
.el-menu-vertical-demo {
  flex: 1;
  border-right: none;
  background: transparent !important;
}

/* 侧边栏选项样式 */
.menu-item {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* 菜单图标样式 */
.menu-item i {
  margin-right: 10px;
}

/* 让图标和文字之间留出一点间隔 */
.menu-text {
  margin-left: 8px;
}

/* 鼠标悬停时背景色 */
.menu-item:hover {
  background-color: rgba(245, 245, 245, 0.7); /* 半透明悬停背景 */
}

/* 选中项的背景色和文字颜色 */
.el-menu-item.is-active {
  background-color: rgba(232, 244, 255, 0.8) !important; /* 半透明选中背景 */
  color: #1e90ff !important;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* 选中项左侧蓝色竖条 */
.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background-color: #1e90ff;
}
</style>
