<template>
  <el-card class="home-card" shadow="hover">
    <div class="logo-container">
      <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
      <h2>BlueArchiveGM 控制台</h2>
      <p class="description">欢迎使用 BlueArchiveGM 控制台，请配置服务器连接信息</p>
    </div>

    <div class="form-container">
      <div class="address-input-group">
        <el-select v-model="protocol" class="protocol-selector" placeholder="协议">
          <el-option label="http://" value="http://" />
          <el-option label="https://" value="https://" />
        </el-select>
        <el-input
          v-model="serverHost"
          placeholder="127.0.0.1:5000"
          clearable
          class="host-input"
        >
          <template #prefix><el-icon><Link /></el-icon></template>
        </el-input>
      </div>

      <el-input v-model="serverAuthKey" placeholder="老师的认证密钥（可选，留空使用Lite版本）" show-password clearable class="input-item">
        <template #prefix><el-icon><Key /></el-icon></template>
      </el-input>

      <div class="action-group">
        <el-button type="primary" @click="saveConfig" :loading="saving" :disabled="!isValid">
          <el-icon><Upload /></el-icon>{{ hasSaved ? '更新配置' : '保存配置' }}
        </el-button>
        <el-button type="success" @click="updateStatus" :loading="updating" :disabled="!isValid || !hasSaved" class="flex-1">
          <el-icon><Refresh /></el-icon>{{ updating ? '更新中...' : '更新服务器状态' }}
        </el-button>
      </div>
    </div>

    <transition name="fade-slide" mode="out-in">
      <div v-if="serverError" key="error">
        <el-card class="status-card error-card">
          <div class="status-header">
            <div class="status-icon error-icon"><el-icon><Warning /></el-icon></div>
            <h3>服务器状态</h3>
          </div>
          <div class="status-content">
            <div class="error-badge">
              <el-icon><CircleCloseFilled /></el-icon><span>服务离线</span>
            </div>
            <div class="error-info">
              <el-icon><InfoFilled /></el-icon><span>{{ serverError }}</span>
            </div>
          </div>
          <div class="update-time"><el-icon><Clock /></el-icon>最后更新：{{ lastUpdate || '--:--:--' }}</div>
        </el-card>
      </div>

      <div v-else-if="hasData" key="content">
        <el-card class="status-card online-card">
          <div class="status-header">
            <div class="status-icon online-icon"><el-icon><Monitor /></el-icon></div>
            <h3>办公室状态</h3>
            <div class="auto-update-badge">
              <el-icon><Refresh /></el-icon><span>{{ isVisible ? '每30秒自动同步' : '后台暂停更新' }}</span>
            </div>
          </div>

          <div class="timer-section">
            <div class="timer-icon"><el-icon><Timer /></el-icon></div>
            <div class="timer-bar-container">
              <div class="timer-bar" :style="{ width: ((30 - countdown) / 30) * 100 + '%' }"></div>
            </div>
            <div class="timer-text">{{ countdown }}s</div>
          </div>

          <el-skeleton :loading="loading" animated :rows="5">
            <div class="status-grid">
              <div class="status-item" v-for="item in statusItems" :key="item.key">
                <div class="status-item-icon" :class="item.iconClass">
                  <el-icon><component :is="item.icon" /></el-icon>
                </div>
                <div class="status-item-content">
                  <div class="status-value">{{ item.value }}</div>
                  <div class="status-label">{{ item.label }}</div>
                </div>
              </div>

              <div class="status-item gauge-item" v-for="gauge in gauges" :key="gauge.type">
                <div class="gauge-container">
                  <div class="gauge-circle">
                    <svg class="gauge-svg" width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r="35" fill="none" :stroke="gauge.bgColor" stroke-width="8" />
                      <circle cx="45" cy="45" r="35" fill="none" :stroke="gauge.color" stroke-width="8"
                              stroke-linecap="round" :stroke-dasharray="`${gauge.percent * 2.199} 219.9`"
                              transform="rotate(-90 45 45)" class="progress-ring" />
                    </svg>
                    <div class="gauge-center">
                      <div class="gauge-icon" :class="gauge.iconClass">
                        <el-icon><component :is="gauge.icon" /></el-icon>
                      </div>
                      <div class="gauge-value">{{ gauge.percent.toFixed(2) }}%</div>
                      <div class="gauge-title">{{ gauge.title }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="update-time"><el-icon><Clock /></el-icon>最后更新：{{ lastUpdate || '--:--:--' }}</div>
          </el-skeleton>
        </el-card>
      </div>

      <el-card v-else key="empty" class="status-card empty-card">
        <div class="empty-content">
          <div class="empty-icon"><el-icon><WarnTriangleFilled /></el-icon></div>
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
  Key, Link, Refresh, Upload, Warning, CircleCloseFilled, InfoFilled, Clock,
  Monitor, Timer, User, Odometer, Stopwatch, Document, Setting, Connection,
  Files, Cpu, Memo, WarnTriangleFilled
} from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    Key, Link, Refresh, Upload, Warning, CircleCloseFilled, InfoFilled, Clock,
    Monitor, Timer, User, Odometer, Stopwatch, Document, Setting, Connection,
    Files, Cpu, Memo, WarnTriangleFilled
  },
  data() {
    return {
      protocol: localStorage.getItem('protocol') || 'http://',
      serverHost: localStorage.getItem('serverHost') || '',
      serverAuthKey: localStorage.getItem('serverAuthKey') || '',
      hasSaved: !!(localStorage.getItem('serverHost') || localStorage.getItem('serverAddress')),
      saving: false,
      updating: false,
      serverData: null,
      serverError: '',
      autoTimer: null,
      errorShown: false,
      lastUpdate: null,
      isVisible: true,
      loading: false,
      countdown: 30,
      timer: null,
    }
  },
  computed: {
    serverAddress() {
      return this.protocol + this.serverHost
    },
    isValid() {
      return this.serverHost && this.serverHost.trim() !== ''
    },
    hasData() { return !!this.serverData || this.loading },
    statusItems() {
      if (!this.serverData) return []
      return [
        { key: 'players', icon: 'User', iconClass: 'teachers-icon', value: this.serverData.playerNum || '0', label: '在线老师' },
        { key: 'tps', icon: 'Odometer', iconClass: 'performance-icon', value: this.serverData.tps || '0', label: '每秒事务' },
        { key: 'rt', icon: 'Stopwatch', iconClass: 'response-icon', value: this.serverData.rt || '0ms', label: '响应时间' },
        { key: 'client', icon: 'Document', iconClass: 'version-icon', value: this.serverData.clientVersion || '未知', label: '客户端版本' },
        { key: 'server', icon: 'Setting', iconClass: 'server-icon', value: this.serverData.serverVersion || '未知', label: '服务器版本' },
        { key: 'api', icon: 'Connection', iconClass: 'api-icon', value: this.serverData.apiVersion || '未知', label: 'API版本' },
        { key: 'commit', icon: 'Files', iconClass: 'commit-icon', value: this.getCommit(), label: '提交哈希' },
        { key: 'memory', icon: 'Memo', iconClass: 'baps-memory-icon', value: this.serverData.baPsMemoryOc || '未知', label: '占用内存' }
      ]
    },
    gauges() {
      return [
        {
          type: 'cpu', title: 'CPU', icon: 'Cpu', iconClass: 'cpu-icon',
          color: '#a8edea', bgColor: 'rgba(168, 237, 234, 0.2)',
          percent: this.getPercent(this.serverData?.cpuOc)
        },
        {
          type: 'memory', title: '内存', icon: 'Memo', iconClass: 'memory-icon',
          color: '#fcb69f', bgColor: 'rgba(252, 182, 159, 0.2)',
          percent: this.getMemoryPercent()
        }
      ]
    }
  },
  methods: {
    async saveConfig() {
      if (!this.isValid) return this.$message.error('请输入服务器地址')
      this.saving = true
      try {
        localStorage.setItem('protocol', this.protocol)
        localStorage.setItem('serverHost', this.serverHost)
        localStorage.setItem('serverAddress', this.serverAddress)
        localStorage.setItem('serverAuthKey', this.serverAuthKey)

        const success = await this.updateStatus(true)
        if (success) {
          this.hasSaved = true
          this.startAuto()
          this.$message.success('配置保存成功')
        } else {
          this.$message.error('无法连接到服务器，请检查配置')
        }
      } catch (error) {
        this.$message.error('操作失败: ' + error.message)
      } finally {
        this.saving = false
      }
    },

    async updateStatus(silent = false) {
      if (this.updating) return false
      this.loading = true
      this.updating = true

      try {
        await this.delay(300)
        const headers = this.serverAuthKey ? { Authorization: this.serverAuthKey } : {}

        const response = await axios.get(`${this.serverAddress}/cdq/api?cmd=ping`, {
          headers,
          timeout: 10000
        })

        if (response.status === 200 && response.data?.code === 0) {
          const parsedData = JSON.parse(response.data.msg)
          await this.updateData(parsedData)
          this.serverError = ''
          if (!silent) this.$message.success('状态更新成功')
          this.errorShown = false
          return true
        } else {
          const errorMsg = response.data?.message || response.data?.msg || '服务器返回错误'
          this.handleError(new Error(errorMsg), silent)
          return false
        }
      } catch (error) {
        this.handleError(error, silent)
        return false
      } finally {
        this.loading = false
        this.updating = false
      }
    },

    async updateData(data) {
      await this.delay(200)
      this.serverData = data
      const now = new Date()
      this.lastUpdate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.toTimeString().slice(0, 8)}`
    },

    handleError(error, silent) {
      this.serverError = error.message || '连接失败'
      if (!silent && !this.errorShown) {
        this.$message.error(`更新失败: ${this.serverError}`)
      }
    },

    async silentUpdate() {
      try {
        const headers = this.serverAuthKey ? { Authorization: this.serverAuthKey } : {}
        const response = await axios.get(`${this.serverAddress}/cdq/api?cmd=ping`, { headers, timeout: 5000 })
        if (response.status === 200 && response.data.code === 0) {
          await this.updateData(JSON.parse(response.data.msg))
          this.serverError = ''
          this.errorShown = false
        }
      } catch (error) {
        this.serverError = error.message || '连接失败'
        if (!this.errorShown) {
          this.$message.warning(`自动同步失败: ${this.serverError}`)
          this.errorShown = true
        }
      }
    },

    startAuto() {
      this.clearAuto()
      this.autoTimer = setInterval(() => this.isVisible && this.silentUpdate(), 30000)
      this.startCountdown()
    },

    clearAuto() {
      this.autoTimer && clearInterval(this.autoTimer)
      this.timer && clearInterval(this.timer)
      this.autoTimer = this.timer = null
    },

    startCountdown() {
      this.countdown = 30
      this.timer = setInterval(() => {
        this.countdown = this.countdown <= 0 ? 30 : this.countdown - 1
      }, 1000)
    },

    handleVisibility() {
      this.isVisible = !document.hidden
      if (this.isVisible && this.hasSaved) {
        this.silentUpdate()
        this.startAuto()
      } else {
        this.clearAuto()
      }
    },

    getPercent(value) {
      if (!value) return 0
      if (typeof value === 'number') {
        return Math.min(100, Math.max(0, value > 1 ? value : value * 100))
      }
      const match = String(value).match(/(\d+(?:\.\d+)?)/)
      if (match) {
        const num = parseFloat(match[1])
        return Math.min(100, Math.max(0, num > 1 ? num : num * 100))
      }
      return 0
    },

    getMemoryPercent() {
      const value = this.serverData?.memoryOc
      if (!value) return 0
      if (typeof value === 'number') {
        return Math.min(100, Math.max(0, value > 1 ? value : value * 100))
      }
      const str = String(value)
      const mbMatch = str.match(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)MB/i)
      if (mbMatch) {
        const used = parseFloat(mbMatch[1])
        const total = parseFloat(mbMatch[2])
        return total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0
      }
      return this.getPercent(value)
    },

    getCommit() {
      const commit = this.serverData?.commit
      return (!commit || commit === '未知') ? '未知' : (commit.length > 8 ? commit.substring(0, 8) : commit)
    },

    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
  },

  mounted() {
    // 兼容旧数据格式
    const oldAddress = localStorage.getItem('serverAddress')
    if (oldAddress && !localStorage.getItem('serverHost')) {
      if (oldAddress.startsWith('https://')) {
        this.protocol = 'https://'
        this.serverHost = oldAddress.substring(8)
      } else if (oldAddress.startsWith('http://')) {
        this.protocol = 'http://'
        this.serverHost = oldAddress.substring(7)
      }
      localStorage.setItem('protocol', this.protocol)
      localStorage.setItem('serverHost', this.serverHost)
      localStorage.removeItem('serverAddress')
    }

    document.addEventListener('visibilitychange', this.handleVisibility)
    if (this.hasSaved) {
      this.silentUpdate()
      this.startAuto()
    }
  },

  beforeUnmount() {
    this.clearAuto()
    document.removeEventListener('visibilitychange', this.handleVisibility)
  }
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
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12), 0 4px 24px -4px rgba(0, 0, 0, 0.08), inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out both;
}

.home-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.16), 0 6px 32px -4px rgba(0, 0, 0, 0.12), inset 0 0 16px rgba(255, 255, 255, 0.5);
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
}

.description {
  color: #4a5568;
  margin-top: 0.5rem;
}

.form-container {
  margin-bottom: 2rem;
}

.input-item {
  margin: 1.2rem 0;
}

.address-input-group {
  display: flex;
  margin: 1.2rem 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.protocol-selector {
  width: 100px;
  flex-shrink: 0;
}

.host-input {
  flex: 1;
}

.action-group {
  margin-top: 2rem;
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.status-card {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12), 0 4px 24px -4px rgba(0, 0, 0, 0.08), inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.16), 0 6px 32px -4px rgba(0, 0, 0, 0.12), inset 0 0 16px rgba(255, 255, 255, 0.5);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.online-card .status-header {
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(79, 172, 254, 0.1);
}

.status-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.online-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.error-icon {
  background: linear-gradient(135deg, #f56c6c 0%, #ff8a80 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
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

.error-card {
  border-left: 4px solid #f56c6c;
}

.status-content {
  text-align: center;
  margin-bottom: 1.5rem;
}

.error-badge {
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
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
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

.teachers-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.performance-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.response-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.version-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.server-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.api-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
.commit-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.baps-memory-icon { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }

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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-icon {
  font-size: 18px;
  margin-bottom: 2px;
}

.cpu-icon { color: #a8edea; }
.memory-icon { color: #fcb69f; }

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
  letter-spacing: 1px;
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
  .status-grid { grid-template-columns: 1fr; }
  .home-card { margin: 0.5rem; padding: 1.5rem; }
  .logo { width: 280px; height: 68px; }
}
</style>