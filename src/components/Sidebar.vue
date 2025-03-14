<template>
  <div class="sidebar" :class="{ 'collapsed': isMobile && !isExpanded }">
    <div class="sidebar-content">
      <div class="logo-wrapper">
        <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
      </div>

      <el-menu
        class="el-menu-vertical-demo"
        :default-active="$route.path"
        router
        :collapse="isMobile && !isExpanded"
        background-color="transparent"
        text-color="#000000"
        active-text-color="#1E90FF"
      >
        <el-menu-item index="/" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-house-door" @click.stop="handleIconClick('/')"></i>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/give" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-gift" @click.stop="handleIconClick('/give')"></i>
          <template #title>给予物品</template>
        </el-menu-item>
        <el-menu-item index="/give-all" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-gift-fill" @click.stop="handleIconClick('/give-all')"></i>
          <template #title>给予全部物品</template>
        </el-menu-item>
        <el-menu-item index="/get-player" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-person" @click.stop="handleIconClick('/get-player')"></i>
          <template #title>获取玩家信息</template>
        </el-menu-item>
        <el-menu-item index="/mail" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-envelope" @click.stop="handleIconClick('/mail')"></i>
          <template #title>发送邮件</template>
        </el-menu-item>
        <el-menu-item index="/get-email-code" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-envelope-open" @click.stop="handleIconClick('/get-email-code')"></i>
          <template #title>获取邮箱验证码</template>
        </el-menu-item>
        <el-sub-menu index="1" popper-class="custom-submenu">
          <template #title>
            <i class="bi bi-columns-gap"></i>
            <span class="menu-text">ID列表</span>
          </template>
          <el-menu-item index="/item-list" @click.native="handleMenuClick">
            <i class="bi bi-list-nested" @click.stop="handleIconClick('/item-list')"></i>
            <span class="menu-text">物品列表</span>
          </el-menu-item>
          <el-menu-item index="/submenu1-2" @click.native="handleMenuClick">
            <i class="bi bi-file-earmark" @click.stop="handleIconClick('/submenu1-2')"></i>
            <span class="menu-text">暂未开发</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/about" class="menu-item" @click.native="handleMenuClick">
          <i class="bi bi-info-circle" @click.stop="handleIconClick('/about')"></i>
          <template #title>关于</template>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Sidebar',
  setup() {
    const router = useRouter()
    const isMobile = ref(false)
    const isExpanded = ref(false)
    let autoCloseTimer = null

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      if (!isMobile.value) {
        isExpanded.value = false
      }
    }

    const handleIconClick = (route) => {
      if (isMobile.value) {
        // 先进行路由跳转
        router.push(route)
        // 延迟展开菜单
        setTimeout(() => {
          isExpanded.value = true
          startAutoCloseTimer()
        }, 100)
      }
    }

    const handleMenuClick = () => {
      if (isMobile.value && isExpanded.value) {
        isExpanded.value = false
        clearAutoCloseTimer()
      }
    }

    const startAutoCloseTimer = () => {
      clearAutoCloseTimer()
      autoCloseTimer = setTimeout(() => {
        if (isExpanded.value) {
          isExpanded.value = false
        }
      }, 2000)
    }

    const clearAutoCloseTimer = () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
        autoCloseTimer = null
      }
    }

    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar')
      if (isMobile.value && isExpanded.value && sidebar && !sidebar.contains(event.target)) {
        isExpanded.value = false
        clearAutoCloseTimer()
      }
    }

    const handleMouseMove = () => {
      if (isMobile.value && isExpanded.value) {
        startAutoCloseTimer()
      }
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('mousemove', handleMouseMove)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('mousemove', handleMouseMove)
      clearAutoCloseTimer()
    })

    watch(isExpanded, (newValue) => {
      if (!newValue) {
        clearAutoCloseTimer()
      }
    })

    return {
      isMobile,
      isExpanded,
      handleIconClick,
      handleMenuClick
    }
  }
}
</script>

<style scoped>
/* PC端样式 */
.sidebar {
  width: 220px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background-color: rgba(255, 255, 255, 0.47);
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow: visible !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.sidebar-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.logo-wrapper {
  text-align: center;
  padding: 20px 0;
  transition: all 0.3s ease;
}

.sidebar-logo {
  width: 200px;
  height: auto;
  transition: all 0.3s ease;
}

.el-menu-vertical-demo {
  flex: 1;
  border-right: none;
  background: transparent !important;
}

.menu-item {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.menu-text {
  margin-left: 8px;
}

.menu-item:hover {
  background-color: rgba(245, 245, 245, 0.7);
}

.el-menu-item.is-active {
  background-color: rgba(232, 244, 255, 0.8) !important;
  color: #1e90ff !important;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background-color: #1e90ff;
}

/* PC端图标样式 */
@media screen and (min-width: 769px) {
  .menu-item i {
    pointer-events: none;
    padding: 0;
    margin-right: 10px;
    font-size: 18px;
  }

  .menu-item i:hover {
    background-color: transparent;
    transform: none;
  }
}

/* 移动端样式 */
@media screen and (max-width: 768px) {
  .el-menu {
    transition: none !important;
  }

  .el-menu-item,
  .el-sub-menu__title {
    transition: none !important;
  }

  .el-menu--collapse {
    transition: none !important;
  }

  .sidebar.collapsed {
    width: 64px;
  }

  .sidebar.collapsed .logo-wrapper {
    padding: 10px;
  }

  .sidebar.collapsed .sidebar-logo {
    width: 40px;
  }

  /* 修改菜单项样式，确保图标居中 */
  .sidebar.collapsed .el-menu-item {
    padding: 0 !important;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 修改图标容器样式 */
  .menu-item i {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    margin: 0 !important;
  }

  .sidebar.collapsed .menu-item i {
    font-size: 20px;
    margin: 0 !important;
    padding: 0;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 子菜单图标居中 */
  .sidebar.collapsed .el-sub-menu__title {
    padding: 0 !important;
    justify-content: center;
  }

  .sidebar.collapsed .el-sub-menu__icon-arrow {
    display: none;
  }

  /* 确保子菜单项也居中 */
  :deep(.el-menu--popup-right-start) {
    margin-left: 5px !important;
  }

  :deep(.el-menu--popup) .el-menu-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 20px !important;
  }

  /* 子菜单样式 */
  :deep(.el-sub-menu .el-menu) {
    background-color: rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(10px);
  }

  :deep(.el-menu--popup) {
    background-color: rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(10px);
    border: none;
    min-width: 180px;
  }
}
</style>
