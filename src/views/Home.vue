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
          placeholder="办公室地址（例：http://127.0.0.1:5000）"
          clearable
        >
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="input-container">
        <el-input
          v-model="serverAuthKey"
          placeholder="老师的认证密钥（可选）"
          show-password
          clearable
        >
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
          {{ hasSaved ? '更新配置' : '保存配置' }}
        </el-button>

        <el-button
          type="success"
          @click="manualUpdate"
          :loading="updating"
          class="update-button"
          :disabled="!isFormValid || !hasSaved"
        >
          <el-icon class="icon"><Refresh /></el-icon>
          {{ updating ? '更新中...' : '更新服务器状态' }}
        </el-button>
      </div>
    </div>

    <transition name="fade-slide" mode="out-in">
      <!-- 当存在错误时，显示服务离线状态及错误原因 -->
      <div v-if="serverError" key="error">
        <el-card class="server-status-card offline-card">
          <div class="status-header">
            <div class="status-icon offline-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <h3 class="server-title">服务器状态</h3>
          </div>
          <div class="status-content">
            <div class="status-badge offline-badge">
              <el-icon><CircleCloseFilled /></el-icon>
              <span>服务离线</span>
            </div>
            <div class="error-info">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ serverError }}</span>
            </div>
          </div>
          <div class="update-time">
            <el-icon><Clock /></el-icon>
            最后更新：{{ lastUpdate || '--:--:--' }}
          </div>
        </el-card>
      </div>
      <!-- 正常情况下显示数据 -->
      <div v-else-if="hasData" key="content">
        <el-card class="server-status-card online-card">
          <div class="status-header">
            <div class="status-icon online-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <h3 class="server-title">办公室状态</h3>
            <div class="auto-update-badge">
              <el-icon><Refresh /></el-icon>
              <span>{{ autoUpdateStatus }}</span>
            </div>
          </div>

          <!-- 计时器区域 -->
          <div class="timer-section">
            <div class="timer-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="timer-bar-container">
              <div class="timer-bar" :style="{ width: ((30 - countdown) / 30) * 100 + '%' }"></div>
            </div>
            <div class="timer-text">{{ countdown }}s</div>
          </div>

          <el-skeleton :loading="loading" animated :rows="5">
            <div class="status-grid">
              <div class="status-item">
                <div class="status-item-icon teachers-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.playerNum }}</div>
                  <div class="status-label">在线老师</div>
                </div>
              </div>

              <div class="status-item">
                <div class="status-item-icon performance-icon">
                  <el-icon><Odometer /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.tps }}</div>
                  <div class="status-label">服务器性能</div>
                </div>
              </div>

              <div class="status-item">
                <div class="status-item-icon response-icon">
                  <el-icon><Stopwatch /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.rt }}</div>
                  <div class="status-label">响应时间</div>
                </div>
              </div>

              <div class="status-item">
                <div class="status-item-icon version-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.clientVersion }}</div>
                  <div class="status-label">客户端版本</div>
                </div>
              </div>

              <div class="status-item">
                <div class="status-item-icon server-icon">
                  <el-icon><Setting /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.serverVersion }}</div>
                  <div class="status-label">服务器版本</div>
                </div>
              </div>

              <div class="status-item">
                <div class="status-item-icon commit-icon">
                  <el-icon><Connection /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.commit && serverData.commit !== '未知' ? serverData.commit.substring(0, 8) : serverData.commit || '未知' }}</div>
                  <div class="status-label">提交哈希</div>
                </div>
              </div>

              <div class="status-item">
                <div class="status-item-icon baps-memory-icon">
                  <el-icon><Files /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ serverData.baPsMemoryOc || '未知' }}</div>
                  <div class="status-label">BaPs内存</div>
                </div>
              </div>

              <div class="status-item gauge-item">
                <div class="gauge-container">
                  <div class="gauge-circle">
                    <svg class="gauge-svg" width="90" height="90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r="35"
                        fill="none"
                        stroke="rgba(168, 237, 234, 0.2)"
                        stroke-width="8"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r="35"
                        fill="none"
                        stroke="#a8edea"
                        stroke-width="8"
                        stroke-linecap="round"
                        :stroke-dasharray="`${getCpuPercent() * 2.199} 219.9`"
                        transform="rotate(-90 45 45)"
                        class="progress-ring"
                      />
                    </svg>
                    <div class="gauge-center">
                      <div class="gauge-icon cpu-icon">
                        <el-icon><Cpu /></el-icon>
                      </div>
                      <div class="gauge-value">{{ serverData.cpuOc }}</div>
                      <div class="gauge-title">CPU</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="status-item gauge-item">
                <div class="gauge-container">
                  <div class="gauge-circle">
                    <svg class="gauge-svg" width="90" height="90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r="35"
                        fill="none"
                        stroke="rgba(252, 182, 159, 0.2)"
                        stroke-width="8"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r="35"
                        fill="none"
                        stroke="#fcb69f"
                        stroke-width="8"
                        stroke-linecap="round"
                        :stroke-dasharray="`${getMemoryPercent() * 2.199} 219.9`"
                        transform="rotate(-90 45 45)"
                        class="progress-ring"
                      />
                    </svg>
                    <div class="gauge-center">
                      <div class="gauge-icon memory-icon">
                        <el-icon><Memo /></el-icon>
                      </div>
                      <div class="gauge-value">{{ getMemoryPercent().toFixed(2) }}%</div>
                      <div class="gauge-title">内存</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="update-time">
              <el-icon><Clock /></el-icon>
              最后更新：{{ lastUpdate || '--:--:--' }}
            </div>
          </el-skeleton>
        </el-card>
      </div>
      <el-card v-else key="empty" class="server-status-card empty-card">
        <div class="empty-content">
          <div class="empty-icon">
            <el-icon><WarnTriangleFilled /></el-icon>
          </div>
          <div class="empty-text">暂无服务器状态数据</div>
          <div class="empty-hint">请先保存配置并更新状态</div>
        </div>
      </el-card>
    </transition>
  </el-card>
</template>

<script>
import axios from 'axios'
import {
  CircleCloseFilled,
  Clock,
  Cpu,
  Document,
  InfoFilled,
  Key,
  Link,
  Memo,
  Monitor,
  Odometer,
  Refresh,
  Setting,
  Stopwatch,
  Timer,
  Upload,
  User,
  Warning,
  WarnTriangleFilled,
  Connection,
  Files,
} from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    Key,
    Link,
    Refresh,
    Upload,
    Warning,
    CircleCloseFilled,
    InfoFilled,
    Clock,
    Monitor,
    Timer,
    User,
    Odometer,
    Stopwatch,
    Document,
    Setting,
    Cpu,
    Memo,
    WarnTriangleFilled,
    Connection,
    Files,
  },
  data() {
    return {
      serverAddress: localStorage.getItem('serverAddress') || '',
      serverAuthKey: localStorage.getItem('serverAuthKey') || '',
      hasSaved: !!localStorage.getItem('serverAddress'),
      saving: false,
      updating: false,
      serverData: null,
      serverError: '', // 用于记录错误原因
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
          this.serverError = '' // 成功更新后清除错误
          if (!silent) this.$message.success('状态更新成功')
          this.autoUpdateErrorShown = false
          return true
        } else {
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
          this.serverError = '' // 成功时清除错误信息
          this.autoUpdateErrorShown = false
        }
      } catch (error) {
        if (!this.autoUpdateErrorShown) {
          this.$message.warning(`自动同步失败: ${error.message}`)
          this.autoUpdateErrorShown = true
        }
        this.handleUpdateError(error, true)
      }
    },

    async applyDataUpdate(parsedData) {
      // 更新服务器数据
      const tempData = { ...this.serverData }
      tempData.playerNum = parsedData.playerNum || 0
      tempData.tps = parsedData.tps || 0
      this.serverData = { ...tempData }
      await this.$nextTick()
      tempData.rt = parsedData.rt || 0
      tempData.clientVersion = parsedData.clientVersion || '未知'
      tempData.serverVersion = parsedData.serverVersion || '未知'
      tempData.commit = parsedData.commit || '未知'
      this.serverData = { ...tempData }
      await this.$nextTick()
      tempData.cpuOc = parsedData.cpuOc ? parsedData.cpuOc.toFixed(2) + '%' : '未知'
      tempData.memoryOc = parsedData.memoryOc || '未知'
      tempData.baPsMemoryOc = parsedData.baPsMemoryOc || '未知'
      this.serverData = { ...tempData }
      this.lastUpdate = this.getCurrentTime()
      // 每次成功更新后重置并启动倒计时
      this.clearCountdown()
      this.countdown = 30
      this.startCountdown()
    },

    handleUpdateError(error, silent) {
      let message = ''
      // 如果返回401，则替换为自定义错误提示
      if (error.response && error.response.status === 401) {
        message = '老师！您貌似没有认证密钥哦，请检查首页认证密钥是否输入正确！'
      } else {
        message = '状态更新失败: '
        if (error.response) {
          message += `服务器错误 (${error.response.status})`
        } else if (error.request) {
          message += '无法连接到服务器'
        } else {
          message += error.message
        }
      }
      this.serverError = message // 保存错误原因以便在状态卡片中显示
      this.clearCountdown() // 更新失败时停止倒计时
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

    // 清除倒计时
    clearCountdown() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    // 仅在成功更新服务器状态后启动倒计时
    startCountdown() {
      if (this.timerInterval) return
      this.timerInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--
        } else {
          this.countdown = 30
          this.progressKey++
        }
      }, 1000)
    },

    handleVisibilityChange() {
      this.isPageVisible = document.visibilityState === 'visible'
      if (this.isPageVisible) {
        setTimeout(() => this.startAutoUpdate(), 300)
      } else {
        this.clearAutoUpdate()
      }
    },

    getCpuPercent() {
      if (this.serverData && this.serverData.cpuOc) {
        const percent = parseFloat(this.serverData.cpuOc.replace('%', ''))
        return Math.round(percent)
      }
      return 0
    },

    getMemoryPercent() {
      if (this.serverData && this.serverData.memoryOc) {
        const memoryStr = this.serverData.memoryOc.toString()

        // 如果已经是百分比格式
        if (memoryStr.includes('%')) {
          return parseFloat(memoryStr.replace('%', ''))
        }

        // 处理 "736.83/15776.36MB" 格式
        const match = memoryStr.match(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/)
        if (match) {
          const used = parseFloat(match[1])
          const total = parseFloat(match[2])
          if (total > 0) {
            return (used / total) * 100
          }
        }
      }
      return 0
    },
  },

  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.clearAutoUpdate()
    this.clearCountdown()
  },

  mounted() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    if (this.hasSaved) {
      this.handleVisibilityChange()
    }
  },
}
</script>

<style scoped>
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

.action-group {
  margin-top: 2rem;
  display: flex;
  gap: 12px;
  align-items: center;
}

.save-button,
.update-button {
  min-width: 120px;
  padding: 0 20px;
  flex-shrink: 0;
  transition: transform 0.3s;
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

.online-card .status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(79, 172, 254, 0.1);
}

.online-card .status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.auto-update-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 20px;
  color: #4facfe;
  font-size: 12px;
  font-weight: 500;
}

/* 离线状态样式 */
.offline-card {
  border-left: 4px solid #f56c6c;
}

.offline-card .status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.offline-card .status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f56c6c 0%, #ff8a80 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.status-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.offline-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.3);
  border-radius: 20px;
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

/* 空状态样式 */
.empty-card {
  border-left: 4px solid #909399;
}

.empty-content {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}

.empty-text {
  font-size: 18px;
  color: #909399;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 14px;
  color: #c0c4cc;
}

.server-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  text-align: left;
}

/* 计时器区域样式 */
.timer-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1rem 0 2rem;
  padding: 1rem;
  background: rgba(79, 172, 254, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(79, 172, 254, 0.1);
}

.timer-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.timer-bar-container {
  flex: 1;
  height: 6px;
  background: rgba(79, 172, 254, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  width: 0;
  transition: width 1s linear;
  box-shadow: 0 0 8px rgba(79, 172, 254, 0.4);
}

.timer-text {
  font-size: 14px;
  color: #4facfe;
  font-weight: 600;
  min-width: 32px;
  text-align: right;
}

/* 状态网格样式 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(79, 172, 254, 0.1);
  transition: all 0.3s ease;
}

.status-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.15);
  border-color: rgba(79, 172, 254, 0.3);
}

.status-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  flex-shrink: 0;
}

.teachers-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.performance-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.response-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.version-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.server-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.commit-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.baps-memory-icon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

/* 仪表盘样式 */
.gauge-item {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  min-height: 120px;
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(79, 172, 254, 0.15) !important;
}

.gauge-container {
  position: relative;
  width: 90px;
  height: 90px;
}

.gauge-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.progress-ring {
  transition: stroke-dasharray 1s ease-in-out;
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-icon {
  font-size: 18px;
  margin-bottom: 2px;
}

.gauge-icon.cpu-icon {
  color: #a8edea;
}

.gauge-icon.memory-icon {
  color: #fcb69f;
}

.gauge-value {
  font-size: 11px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 1px;
}

.gauge-title {
  font-size: 9px;
  color: #666;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-item-content {
  flex: 1;
}

.status-value {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
  margin-bottom: 2px;
  word-break: break-all;
}

.status-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.update-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(79, 172, 254, 0.1);
  color: #666;
  font-size: 0.9em;
}

@keyframes progressAnimation {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
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

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }

  .online-card .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .timer-section {
    flex-direction: column;
    gap: 8px;
  }

  .timer-bar-container {
    width: 100%;
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

  .status-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style>