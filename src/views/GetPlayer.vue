<template>
  <el-card class="function-card" shadow="hover">
    <div class="card-header">
      <h2>玩家数据导出</h2>
      <p class="description">获取玩家的完整数据库数据，支持JSON和Base64格式导出</p>
    </div>
    
    <el-form :model="form" label-width="120px" class="player-form">
      <el-form-item label="玩家UID" required>
        <el-input 
          v-model="form.uid" 
          placeholder="请输入玩家UID"
          @input="form.uid = form.uid.replace(/\D/g, '')"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="输出格式">
        <div class="form-item-content">
          <el-radio-group v-model="form.json">
            <el-radio :label="1">JSON格式</el-radio>
            <el-radio :label="0">Base64格式</el-radio>
          </el-radio-group>
          <div class="help-text">
            <el-icon><InfoFilled /></el-icon>
            <span>JSON格式便于查看，Base64格式便于传输和存储</span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="数据范围">
        <div class="form-item-content">
          <el-radio-group v-model="form.basis">
            <el-radio :label="0">完整数据</el-radio>
            <el-radio :label="1">仅基础数据</el-radio>
          </el-radio-group>
          <div class="help-text">
            <el-icon><InfoFilled /></el-icon>
            <span>基础数据包含主要游戏信息，完整数据包含所有详细信息</span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item>
        <el-button 
          class="export-btn" 
          type="primary" 
          @click="handleGetPlayer"
          :loading="isLoading"
        >
          <el-icon><Download /></el-icon>
          {{ isLoading ? '导出中...' : '导出玩家数据' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 数据展示区域 -->
    <div v-if="playerData" class="data-display">
      <div class="data-header">
        <h3>导出结果</h3>
        <div class="data-actions">
          <el-button 
            size="small" 
            @click="copyData" 
            :icon="DocumentCopy"
          >
            复制数据
          </el-button>
          <el-button 
            size="small" 
            @click="downloadData" 
            :icon="Download"
          >
            下载文件
          </el-button>
        </div>
      </div>
      
      <div class="data-content">
        <!-- JSON格式展示 -->
        <div v-if="form.json === 1" class="json-display">
          <el-input
            v-model="playerData"
            type="textarea"
            :rows="20"
            readonly
            class="data-textarea"
          />
        </div>
        
        <!-- Base64格式展示 -->
        <div v-else class="base64-display">
          <el-input
            v-model="playerData"
            type="textarea"
            :rows="10"
            readonly
            class="data-textarea"
            placeholder="Base64编码的数据"
          />
        </div>
      </div>
      
      <div class="data-footer">
        <div class="data-info">
          <el-icon><InfoFilled /></el-icon>
          <span>数据大小: {{ dataSize }} | 导出时间: {{ exportTime }}</span>
        </div>
      </div>
    </div>

    <!-- 错误信息展示 -->
    <el-alert
      v-if="errorMessage"
      title="导出失败"
      type="error"
      :description="errorMessage"
      show-icon
      closable
      @close="errorMessage = ''"
      class="error-alert"
    />
  </el-card>
</template>

<script>
import axios from 'axios'
import { User, Download, DocumentCopy, InfoFilled } from '@element-plus/icons-vue'

export default {
  name: 'GetPlayer',
  components: { 
    User, 
    Download, 
    DocumentCopy, 
    InfoFilled 
  },
  data() {
    return {
      form: {
        uid: '',
        json: 1,  // 默认JSON格式
        basis: 0, // 默认完整数据
      },
      playerData: '',
      errorMessage: '',
      isLoading: false,
      dataSize: '',
      exportTime: '',
    }
  },
  methods: {
    async handleGetPlayer() {
      if (!this.form.uid) {
        this.$message.error('请输入玩家UID')
        return
      }

      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      this.isLoading = true
      this.playerData = ''
      this.errorMessage = ''

      try {
        const params = {
          cmd: 'getPlayer',
          uid: parseInt(this.form.uid),
          json: this.form.json,
          basis: this.form.basis,
        }

        const headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }

        const res = await axios.get(`${baseURL}/cdq/api`, {
          params,
          headers,
        })

        if (res.data.code === 0) {
          // 处理返回的数据
          if (this.form.json === 1) {
            // JSON格式，美化显示
            this.playerData = JSON.stringify(res.data.data || res.data.msg, null, 2)
          } else {
            // Base64格式
            this.playerData = res.data.data || res.data.msg
          }
          
          // 计算数据大小
          this.dataSize = this.formatBytes(new Blob([this.playerData]).size)
          this.exportTime = new Date().toLocaleString()
          
          this.$message.success('玩家数据导出成功')
        } else {
          this.errorMessage = res.data.msg || '导出失败，请检查玩家UID是否正确'
          this.$message.error('导出失败')
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        this.errorMessage = `请求错误：${errorMsg}`
        this.$message.error('导出失败，请检查网络连接')
        console.error('导出错误:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 复制数据到剪贴板
    async copyData() {
      try {
        await navigator.clipboard.writeText(this.playerData)
        this.$message.success('数据已复制到剪贴板')
      } catch (error) {
        this.$message.error('复制失败，请手动选择复制')
      }
    },

    // 下载数据文件
    downloadData() {
      const fileName = `player_${this.form.uid}_${Date.now()}.${this.form.json === 1 ? 'json' : 'txt'}`
      const blob = new Blob([this.playerData], { 
        type: this.form.json === 1 ? 'application/json' : 'text/plain' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.$message.success(`文件已下载：${fileName}`)
    },

    // 格式化字节大小
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 900px;
  margin: 2rem auto;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out both;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

/* 卡片头部 */
.card-header {
  margin-bottom: 32px;
}

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  position: relative;
}

:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

.description {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 表单样式 */
.player-form {
  margin-bottom: 32px;
}

.form-item-content {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
  line-height: 1.5;
}

.help-text {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  padding-left: 0;
}

.help-text .el-icon {
  margin-right: 6px;
  margin-top: 1px;
  color: #3b82f6;
  flex-shrink: 0;
}

.export-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  font-weight: 600;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

/* 数据展示区域 */
.data-display {
  margin-top: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(249, 250, 251, 0.8);
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid #e5e7eb;
}

.data-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.data-actions {
  display: flex;
  gap: 12px;
}

.data-content {
  padding: 20px;
}

.json-display,
.base64-display {
  margin: 0;
  padding: 0;
}

.data-textarea {
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
}

:deep(.data-textarea .el-textarea__inner) {
  background: #1e1e1e !important;
  color: #e6e6e6 !important;
  border: 1px solid #374151 !important;
  border-radius: 8px !important;
  font-size: 13px;
  line-height: 1.5;
  padding: 16px !important;
}

.data-footer {
  border-top: 1px solid #e5e7eb;
  background: rgba(249, 250, 251, 0.9);
}

.data-info {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.data-info .el-icon {
  margin-right: 8px;
  color: #3b82f6;
  flex-shrink: 0;
}

.error-alert {
  margin-top: 32px;
  border-radius: 8px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .function-card {
    margin: 20px;
    border-radius: 12px;
  }
  
  .data-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
  }
  
  .data-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .data-content {
    padding: 16px;
  }
  
  .data-info {
    padding: 12px 16px;
  }
  
  :deep(.data-textarea .el-textarea__inner) {
    font-size: 12px;
    padding: 12px !important;
  }
  
  :deep(.el-form-item__label) {
    line-height: 1.4;
  }
}

@media (max-width: 480px) {
  .function-card {
    margin: 16px;
  }
  
  .card-header {
    margin-bottom: 24px;
  }
  
  .player-form {
    margin-bottom: 24px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .data-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .data-actions .el-button {
    width: 100%;
  }
}
</style>
