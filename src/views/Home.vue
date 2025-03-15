<template>
  <el-card class="home-card" shadow="hover">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <h2>BlueArchiveGM 控制台</h2>
      <p class="description">欢迎使用 BlueArchiveGM 控制台，请配置服务器连接信息</p>
    </div>

    <div class="form-container">
      <div class="input-container">
        <el-input
          v-model="serverAddress"
          placeholder="服务器地址（例：http://127.0.0.1:5000）"
          clearable
        >
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="input-container">
        <el-input v-model="serverAuthKey" placeholder="认证密钥（可选）" show-password clearable>
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="action-group">
        <el-button
          type="primary"
          @click="saveConfig"
          :loading="saving"
          class="save-button"
          :disabled="!isFormValid"
        >
          <el-icon class="icon"><Upload /></el-icon>
          <span class="button-text">{{ hasSaved ? '更新配置' : '保存配置' }}</span>
        </el-button>

        <el-button
          type="success"
          @click="manualUpdate"
          :loading="updating"
          class="update-button"
          :disabled="!isFormValid || !hasSaved"
        >
          <el-icon class="icon"><Refresh /></el-icon>
          <span class="button-text">{{ updating ? '更新中...' : '更新服务器状态' }}</span>
        </el-button>
      </div>
    </div>

    <transition name="fade-slide" mode="out-in">
      <div v-if="hasData" key="content">
        <el-card class="server-status-card">
          <h3 class="server-title">服务器状态（{{ autoUpdateStatus }}）</h3>
          <!-- 计时器区域 -->
          <div class="timer-bar-container">
            <div class="timer-bar" :key="progressKey"></div>
            <span class="timer-text">{{ countdown }}s</span>
          </div>
          <el-skeleton :loading="loading" animated :rows="5">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户数量">
                {{ serverData.playerNum }}
              </el-descriptions-item>
              <el-descriptions-item label="TPS">
                {{ serverData.tps }}
              </el-descriptions-item>
              <el-descriptions-item label="RT">
                {{ serverData.rt }}
              </el-descriptions-item>
              <el-descriptions-item label="客户端版本">
                {{ serverData.clientVersion }}
              </el-descriptions-item>
              <el-descriptions-item label="服务器版本">
                {{ serverData.serverVersion }}
              </el-descriptions-item>
              <el-descriptions-item label="CPU 状态">
                {{ serverData.cpuOc }}
              </el-descriptions-item>
              <el-descriptions-item label="内存状态">
                {{ serverData.memoryOc }}
              </el-descriptions-item>
            </el-descriptions>
            <div class="update-time">最后更新：{{ lastUpdate || '--:--:--' }}</div>
          </el-skeleton>
        </el-card>
      </div>
      <el-card v-else key="empty" class="server-status-card empty-placeholder">
        <div class="empty-text">暂无服务器状态数据</div>
      </el-card>
    </transition>
  </el-card>
</template>

<script>
import axios from 'axios'
import { Key, Link, Refresh, Upload } from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: { Key, Link, Refresh, Upload },
  data() {
    return {
      serverAddress: localStorage.getItem('serverAddress') || '',
      serverAuthKey: localStorage.getItem('serverAuthKey') || '',
      hasSaved: !!localStorage.getItem('serverAddress'),
      saving: false,
      updating: false,
      serverData: null,
      autoUpdateTimer: null,
      autoUpdateErrorShown: false,
      lastUpdate: null,
      isPageVisible: true,
      loading: false,
      updateQueue: null,
      countdown: 30, // 30秒倒计时初始值
      timerInterval: null,
      progressKey: 0, // 用于重置 CSS 动画的 key
    }
  },
  computed: {
    isFormValid() {
      // 只校验地址是否有效，不再要求必须填写认证密钥
      return this.serverAddress && this.serverAddress.startsWith('http')
    },
    autoUpdateStatus() {
      return this.isPageVisible ? '每30秒自动同步' : '后台暂停更新'
    },
    hasData() {
      return !!this.serverData || this.loading
    },
  },
  methods: {
    async saveConfig() {
      if (!this.serverAddress.startsWith('http')) {
        this.$message.error('地址需包含 http/https 协议头')
        return
      }
      this.saving = true
      try {
        localStorage.setItem('serverAddress', this.serverAddress)
        localStorage.setItem('serverAuthKey', this.serverAuthKey)
        if (!this.hasSaved) {
          this.hasSaved = true
          // 尝试更新，若无法连接则提示错误
          const success = await this.manualUpdate(true)
          if (!success) {
            this.$message.error('无法连接到服务器，请检查配置')
          } else {
            this.startAutoUpdate()
            this.$message.success('配置保存成功')
          }
        } else {
          const success = await this.manualUpdate(true)
          if (!success) {
            this.$message.error('无法连接到服务器，请检查配置')
          } else {
            this.restartAutoUpdate()
            this.$message.success('配置更新成功')
          }
        }
      } catch (error) {
        this.$message.error('操作失败: ' + error.message)
      } finally {
        this.saving = false
      }
    },

    async manualUpdate(silent = false) {
      if (this.updating) return false
      this.loading = true
      this.updating = true
      try {
        // 平滑过渡延迟
        await new Promise((resolve) => setTimeout(resolve, 300))
        // 根据是否有认证密钥决定请求头
        const headers = {}
        if (this.serverAuthKey) {
          headers.Authorization = this.serverAuthKey
        }
        const response = await axios.get(`${this.serverAddress}/cdq/api?cmd=ping`, {
          headers,
          timeout: 5000,
        })
        if (response.status === 200 && response.data.code === 0) {
          const parsedData = JSON.parse(response.data.msg)
          await this.applyDataUpdate(parsedData)
          this.countdown = 30
          this.progressKey++
          if (!silent) this.$message.success('状态更新成功')
          this.autoUpdateErrorShown = false
          return true
        } else {
          // 服务器返回非预期数据时视为错误
          this.handleUpdateError(new Error(response.data.message || '服务器返回错误'), silent)
          return false
        }
      } catch (error) {
        this.handleUpdateError(error, silent)
      } finally {
        this.loading = false
        this.updating = false
      }
      return false
    },

    async applyDataUpdate(parsedData) {
      const tempData = { ...this.serverData }
      tempData.playerNum = parsedData.playerNum || 0
      tempData.tps = parsedData.tps || 0
      this.serverData = { ...tempData }
      await this.$nextTick()
      tempData.rt = parsedData.rt || 0
      tempData.clientVersion = parsedData.clientVersion || '未知'
      tempData.serverVersion = parsedData.serverVersion || '未知'
      this.serverData = { ...tempData }
      await this.$nextTick()
      tempData.cpuOc = parsedData.cpuOc ? parsedData.cpuOc.toFixed(2) + '%' : '未知'
      tempData.memoryOc = parsedData.memoryOc || '未知'
      this.serverData = { ...tempData }
      this.lastUpdate = this.getCurrentTime()
    },

    handleUpdateError(error, silent) {
      let message = '状态更新失败: '
      if (error.response) {
        message += `服务器错误 (${error.response.status})`
      } else if (error.request) {
        message += '无法连接到服务器'
      } else {
        message += error.message
      }
      if (!silent) this.$message.error(message)
    },

    startAutoUpdate() {
      this.clearAutoUpdate()
      if (!this.hasSaved) return
      this.updateQueue = setTimeout(() => {
        if (!this.isPageVisible) return
        this.autoUpdateTimer = setInterval(async () => {
          if (document.visibilityState === 'visible') {
            try {
              await this.silentUpdate()
            } catch (error) {
              console.error('Auto update error:', error)
            }
          }
        }, 30000)
        this.silentUpdate()
      }, 500)
    },

    async silentUpdate() {
      try {
        const headers = {}
        if (this.serverAuthKey) {
          headers.Authorization = this.serverAuthKey
        }
        const response = await axios.get(`${this.serverAddress}/cdq/api?cmd=ping`, {
          headers,
          timeout: 5000,
        })
        if (response.status === 200 && response.data.code === 0) {
          const parsedData = JSON.parse(response.data.msg)
          await this.applyDataUpdate(parsedData)
          this.countdown = 30
          this.progressKey++
          this.autoUpdateErrorShown = false
        }
      } catch (error) {
        if (!this.autoUpdateErrorShown) {
          this.$message.warning(`自动同步失败: ${error.message}`)
          this.autoUpdateErrorShown = true
        }
      }
    },

    getCurrentTime() {
      const now = new Date()
      return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    },

    restartAutoUpdate() {
      this.clearAutoUpdate()
      this.startAutoUpdate()
    },

    clearAutoUpdate() {
      clearTimeout(this.updateQueue)
      if (this.autoUpdateTimer) {
        clearInterval(this.autoUpdateTimer)
        this.autoUpdateTimer = null
      }
    },

    handleVisibilityChange() {
      this.isPageVisible = document.visibilityState === 'visible'
      if (this.isPageVisible) {
        setTimeout(() => this.startAutoUpdate(), 300)
      } else {
        this.clearAutoUpdate()
      }
    },

    startCountdown() {
      // 每秒更新一次倒计时
      this.timerInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          // 当倒计时归零时重置倒计时并触发 CSS 动画重启
          this.countdown = 30
          this.progressKey++
        }
      }, 1000)
    },
  },

  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.clearAutoUpdate()
    clearInterval(this.timerInterval)
  },

  mounted() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    if (this.hasSaved) {
      this.handleVisibilityChange()
    }
    this.startCountdown()
  },
}
</script>

<style scoped>
/* 样式保持不变 */
.home-card {
  max-width: 680px;
  margin: 1rem auto;
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out both;
}

.home-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 1rem 0;
  font-weight: 600;
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 隐藏溢出部分 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
  width: 100%; /* 确保宽度填满容器 */
}

.logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  width: 370px;
  height: 90px;
  margin-bottom: 1rem;
  object-fit: contain;
  transition: opacity 0.3s;
  max-width: 100%;
}

.description {
  color: #4a5568;
  margin-top: 0.5rem;
}

.form-container {
  margin-bottom: 2rem;
}

.input-container {
  margin: 1.2rem 0;
}

/* 使用我们自己的间距控制 */
.action-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 统一按钮样式 */
.save-button,
.update-button {
  min-width: 120px;
  padding: 12px 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  border-radius: 8px !important; /* 统一圆角 */
}

.save-button:hover,
.update-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 16px;
  margin-right: 4px;
}

.button-text {
  font-size: 14px;
  line-height: 1;
}

.update-button {
  flex: 1;
  min-width: 160px;
}

.server-status-card {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
}

.server-status-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

.server-title {
  margin: 0 0 1.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.timer-bar-container {
  position: relative;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin: 8px auto 16px;
  width: 80%;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  animation: progressAnimation 30s linear forwards;
}

@keyframes progressAnimation {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.timer-text {
  position: absolute;
  top: -24px;
  right: 0;
  font-size: 0.8em;
  color: #4a5568;
}

.update-time {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

.empty-placeholder {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .home-card {
    margin: 1rem;
    padding: 1.5rem;
  }
  .action-group {
    flex-direction: column;
  }
  .save-button,
  .update-button {
    width: 100%;
    min-width: unset;
  }
}
/* 移动端适配 */
@media (max-width: 768px) {
  .home-card {
    margin: 20px;
    padding: 1.5rem;
    border-radius: 12px;
  }

  h2 {
    font-size: 1.3rem;
    margin: 0.8rem 0;
  }

  .logo {
    width: 100%; /* 改为100%宽度 */
    height: auto; /* 高度自适应 */
    max-width: 280px; /* 设置最大宽度 */
    margin-bottom: 0.8rem;
  }

  .description {
    font-size: 0.9rem;
    margin: 0.8rem 0;
  }

  .form-container {
    margin-bottom: 1.5rem;
  }

  .input-container {
    margin: 1rem 0;
  }

  .action-group {
    flex-direction: column;
    gap: 12px;
  }

  .save-button,
  .update-button {
    width: 100%;
    padding: 10px 20px;
    height: 36px;
  }
  .icon {
    font-size: 14px;
  }

  .button-text {
    font-size: 13px;
  }


  .server-status-card {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 12px;
  }

  .server-title {
    font-size: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 8px;
  }

  /* 覆盖 Element Plus 的默认按钮间距 */
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  :deep(.el-descriptions__cell) {
    padding: 8px !important;
  }

  :deep(.el-descriptions__label) {
    font-size: 0.9rem !important;
  }

  :deep(.el-descriptions__content) {
    font-size: 0.9rem !important;
  }

  .timer-bar-container {
    width: 90%;
    margin: 8px auto 12px;
  }

  .timer-text {
    font-size: 0.75em;
    top: -20px;
  }

  .update-time {
    margin-top: 1rem;
    font-size: 0.8em;
  }

  .empty-placeholder {
    padding: 1.5rem;
    font-size: 0.9rem;
  }
}

/* 优化动画效果在移动端的表现 */
@media (prefers-reduced-motion: reduce) {
  .home-card,
  .server-status-card {
    transition: none;
  }

  .home-card:hover,
  .server-status-card:hover {
    transform: none;
    box-shadow: none;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: opacity 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
