<template>
  <el-card class="function-card" shadow="hover">
    <h2>获取老师信息</h2>
    
    <el-form :model="form" label-width="120px">
      <el-form-item label="老师UID">
        <el-input v-model="form.uid" placeholder="请输入老师的UID">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="输出格式">
        <el-radio-group v-model="form.json">
          <el-radio-button label="0">原始数据</el-radio-button>
          <el-radio-button label="1">JSON格式</el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="数据范围">
        <el-radio-group v-model="form.basis">
          <el-radio-button label="0">完整数据</el-radio-button>
          <el-radio-button label="1">仅基础数据</el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item>
        <el-button class="gradient-button" type="primary" @click="handleGetTeacher" :loading="loading">
          {{ loading ? '获取中...' : '获取信息' }}
        </el-button>
      </el-form-item>
    </el-form>

    <div v-if="responseData" class="response-container">
      <div class="response-header">
        <h3>
          <el-icon><Document /></el-icon>
          响应结果
        </h3>
        <div class="response-actions">
          <el-button size="small" type="primary" @click="copyResponse" :icon="DocumentCopy">
            复制数据
          </el-button>
          <el-button size="small" type="success" @click="downloadResponse" :icon="Download">
            {{ form.json === '1' ? '下载JSON' : '下载TXT' }}
          </el-button>
        </div>
      </div>
      
      <div class="status-info">
        <el-tag :type="responseData.code === 0 ? 'success' : 'danger'" size="large">
          {{ responseData.code === 0 ? '成功' : '失败' }}
        </el-tag>
      </div>

      <div class="data-content">
        <template v-if="responseData.code === 0">
          <div class="data-viewer">
            <div class="section-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>{{ form.json === '1' ? 'JSON数据' : 'Base64数据' }}</span>
            </div>
            <el-scrollbar class="data-container">
              <pre class="data-content-text">{{ displayData }}</pre>
            </el-scrollbar>
          </div>
        </template>

        <template v-else>
          <div class="error-viewer">
            <div class="section-header">
              <el-icon><WarningFilled /></el-icon>
              <span>错误信息</span>
            </div>
            <div class="error-content">
              <p>{{ responseData.msg || '未知错误' }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'
import { 
  User, Document, DocumentCopy, Download, DataAnalysis, 
  WarningFilled 
} from '@element-plus/icons-vue'

export default {
  name: 'GetTeacher',
  components: { 
    User, Document, DocumentCopy, Download, DataAnalysis, 
    WarningFilled 
  },
  data() {
    return {
      form: {
        uid: '',
        json: '1',
        basis: '0',
      },
      loading: false,
      responseData: null,
    }
  },
  computed: {
    displayData() {
      if (!this.responseData || this.responseData.code !== 0) return ''
      
      if (this.form.json === '1') {
        try {
          if (typeof this.responseData.msg === 'string') {
            const parsed = JSON.parse(this.responseData.msg)
            return JSON.stringify(parsed, null, 2)
          }
          return JSON.stringify(this.responseData.msg, null, 2)
        } catch (error) {
          return this.responseData.msg
        }
      }
      
      return this.responseData.msg
    }
  },
  methods: {
    async handleGetTeacher() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      if (!this.form.uid.trim()) {
        this.$message.error('请输入老师UID')
        return
      }

      this.loading = true
      this.responseData = null
      
      try {
        const params = {
          cmd: 'getPlayer',
          uid: this.form.uid,
          encodingFormat: this.form.json === '1' ? 'json' : 'base64',
          basis: this.form.basis
        }
        
        const config = { params }
        if (authKey) config.headers = { Authorization: authKey }
        
        const res = await axios.get(`${baseURL}/cdq/api`, config)

        this.responseData = res.data

        if (res.data.code === 0) {
          this.$message.success('获取老师信息成功')
        } else {
          this.$message.error('获取失败：' + (res.data.msg || '未知错误'))
        }
      } catch (error) {
        this.responseData = {
          code: -1,
          msg: error.response?.data?.message || error.message
        }
        this.$message.error('请求失败：' + this.responseData.msg)
      } finally {
        this.loading = false
      }
    },

    async copyResponse() {
      try {
        await navigator.clipboard.writeText(this.displayData)
        this.$message.success('复制成功')
      } catch (error) {
        this.$message.error('复制失败')
      }
    },

    downloadResponse() {
      let downloadData
      let fileName
      
      if (this.form.json === '1') {
        try {
          if (typeof this.responseData.msg === 'string') {
            const parsed = JSON.parse(this.responseData.msg)
            downloadData = JSON.stringify(parsed, null, 2)
          } else {
            downloadData = JSON.stringify(this.responseData.msg, null, 2)
          }
          fileName = `player_${this.form.uid}_${Date.now()}.json`
        } catch (error) {
          downloadData = this.responseData.msg
          fileName = `player_${this.form.uid}_${Date.now()}.txt`
        }
      } else {
        downloadData = this.responseData.msg
        fileName = `player_${this.form.uid}_${Date.now()}.txt`
      }
      
      const blob = new Blob([downloadData], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      this.$message.success('下载成功')
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 900px;
  margin: 40px auto;
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

h2 {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

.gradient-button {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.gradient-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.response-container {
  margin-top: 2rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.response-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.response-actions {
  display: flex;
  gap: 8px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  padding: 12px;
  background: rgba(79, 172, 254, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(79, 172, 254, 0.1);
}

.data-content {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.data-container {
  max-height: 500px;
  min-height: 200px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  overflow: auto;
}

.data-content-text {
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: #2c3e50;
  min-height: 100%;
}

.error-viewer {
  background: rgba(231, 76, 60, 0.05);
  border: 1px solid rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.error-content {
  color: #e74c3c;
}

.error-content p {
  margin: 8px 0;
}

:deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  border: 1px solid #d1d5db !important;
  background: #f9fafb !important;
  color: #374151 !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  margin-right: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  border-color: #4facfe !important;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
  transform: translateY(-1px) !important;
}
</style>