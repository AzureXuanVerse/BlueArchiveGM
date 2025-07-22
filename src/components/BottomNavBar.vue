<template>
  <div class="bottom-navbar" v-show="isMobile">
    <div class="scroll-container" ref="scrollContainer" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
      <el-menu
        class="bottom-menu"
        :default-active="$route.path"
        router
        background-color="rgba(255, 255, 255, 0.47)"
        text-color="#000000"
        active-text-color="#1E90FF"
      >
        <el-menu-item index="/" class="bottom-menu-item">
          <i class="bi bi-house-door"></i>
          <span class="bottom-menu-text">首页</span>
        </el-menu-item>
        <el-menu-item index="/GiveAll" class="bottom-menu-item">
          <i class="bi bi-gift"></i>
          <span class="bottom-menu-text">物品</span>
        </el-menu-item>
        <el-menu-item index="/Character" class="bottom-menu-item">
          <i class="bi bi-person-gear"></i>
          <span class="bottom-menu-text">学生</span>
        </el-menu-item>
        <el-menu-item index="/Mail" class="bottom-menu-item">
          <i class="bi bi-envelope-at"></i>
          <span class="bottom-menu-text">邮件</span>
        </el-menu-item>
        <el-menu-item index="/GetPlayer" class="bottom-menu-item">
          <i class="bi bi-person"></i>
          <span class="bottom-menu-text">老师</span>
        </el-menu-item>
        <el-menu-item index="/ConfigMaker" class="bottom-menu-item">
          <i class="bi bi-sliders2"></i>
          <span class="bottom-menu-text">配置</span>
        </el-menu-item>
        <el-menu-item index="/IdList" class="bottom-menu-item">
          <i class="bi bi-list-nested"></i>
          <span class="bottom-menu-text">列表</span>
        </el-menu-item>
        <el-menu-item index="/Setting" class="bottom-menu-item">
          <i class="bi bi-gear"></i>
          <span class="bottom-menu-text">设置</span>
        </el-menu-item>
        <el-menu-item index="/Account" class="bottom-menu-item">
          <i class="bi bi-person-circle"></i>
          <span class="bottom-menu-text">账户</span>
        </el-menu-item>
        <el-menu-item index="/About" class="bottom-menu-item">
          <i class="bi bi-info-circle"></i>
          <span class="bottom-menu-text">关于</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomNavBar',
  data() {
    return {
      isMobile: false,
      touchStartX: 0,
      touchEndX: 0,
      touchMoveX: 0,
      isDragging: false
    }
  },
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  unmounted() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
    },
    touchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.isDragging = true
    },
    touchMove(e) {
      if (!this.isDragging) return
      
      this.touchMoveX = e.touches[0].clientX
      const diffX = this.touchStartX - this.touchMoveX

      if (this.$refs.scrollContainer) {
        const currentScroll = this.$refs.scrollContainer.scrollLeft
        this.$refs.scrollContainer.scrollLeft = currentScroll + diffX
        this.touchStartX = this.touchMoveX
      }
    },
    touchEnd(e) {
      this.isDragging = false
    }
  }
}
</script>

<style scoped>
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.47);
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scroll-snap-type: x mandatory;
  position: relative;
}

/* 隐藏滚动条 */
.scroll-container::-webkit-scrollbar {
  display: none;
}

.bottom-menu {
  display: inline-flex;
  width: max-content;
  border-bottom: none;
  padding: 0;
}

.bottom-menu-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px !important;
  height: auto !important;
  line-height: 1.2 !important;
  width: 60px;
}

.bottom-menu-item i {
  font-size: 1.2rem;
  margin-right: 0;
  margin-bottom: 4px;
}

.bottom-menu-text {
  font-size: 0.7rem;
  margin-left: 0 !important;
  white-space: nowrap;
}

/* 选中项的样式 */
.el-menu-item.is-active {
  background-color: rgba(232, 244, 255, 0.8) !important;
  color: #1e90ff !important;
}

.bottom-menu-item:last-child {
  padding-right: 16px !important;
}
</style>