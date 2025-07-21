<template>
  <el-card class="function-card" shadow="hover">
    <h2>游戏设置</h2>
    <el-form :model="form" label-width="120px">
      <!-- 玩家UID -->
      <el-form-item label="玩家UID">
        <el-input v-model="form.uid" placeholder="请输入玩家UID" type="number"></el-input>
      </el-form-item>

      <!-- 类型选择 -->
      <el-form-item label="类型">
        <el-select v-model="form.type" placeholder="请选择类型" @change="handleTypeChange">
          <el-option label="设置玩家等级" value="AccountLevel"></el-option>
          <el-option label="设置玩家通知" value="Toast"></el-option>
          <el-option label="获取玩家配置" value="GetConfig"></el-option>
        </el-select>
      </el-form-item>

      <!-- sub1 输入框 -->
      <el-form-item :label="sub1Label">
        <el-input
          v-model="form.sub1"
          :placeholder="sub1Placeholder"
          :type="form.type === 'AccountLevel' ? 'number' : 'text'"
          :disabled="!form.type || form.type === 'GetConfig'"
        ></el-input>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button class="submit-btn" type="primary" @click="handleSetGame" :loading="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 响应信息 -->
    <div v-if="responseData" class="response-container">
      <div class="response-header">
        <h3>
          <el-icon><Document /></el-icon>
          操作结果
        </h3>
        <div class="response-actions">
          <el-button size="small" type="primary" @click="copyResponse" :icon="DocumentCopy">
            复制数据
          </el-button>
          <el-button size="small" type="success" @click="downloadResponse" :icon="Download">
            下载结果
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
              <span>响应数据</span>
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
  Document, DocumentCopy, Download, DataAnalysis, 
  WarningFilled 
} from '@element-plus/icons-vue'

export default {
  name: 'SetGame',
  components: { 
    Document, DocumentCopy, Download, DataAnalysis, 
    WarningFilled 
  },
  data() {
    return {
      form: {
        uid: '',
        type: '',
        sub1: '',
      },
      responseData: null,
      isSubmitting: false,
    }
  },
  computed: {
    // sub1 的标签
    sub1Label() {
      if (!this.form.type) return '无' // 未选择类型时显示 "无"
      const labelMap = {
        'AccountLevel': '等级',
        'Toast': '通知',
        'GetConfig': '参数'
      }
      return labelMap[this.form.type] || '参数'
    },
    // sub1 的占位符
    sub1Placeholder() {
      if (!this.form.type) {
        return '请选择类型'
      }
      const placeholderMap = {
        'AccountLevel': '请输入玩家等级（数字）',
        'Toast': '请输入通知内容',
        'GetConfig': '无需参数，将获取所有配置信息'
      }
      return placeholderMap[this.form.type] || '请输入参数'
    },
    displayData() {
      if (!this.responseData || this.responseData.code !== 0) return ''
      
      try {
        if (typeof this.responseData.msg === 'string') {
          // 尝试解析JSON
          const parsed = JSON.parse(this.responseData.msg)
          return JSON.stringify(parsed, null, 2)
        }
        return JSON.stringify(this.responseData.msg, null, 2)
      } catch (error) {
        return this.responseData.msg
      }
    }
  },
  methods: {
    handleTypeChange() {
      if (this.form.type === 'GetConfig') {
        this.form.sub1 = 'config' // GetConfig类型设置默认值
      } else {
        this.form.sub1 = '' // 其他类型清空 sub1
      }
    },
    async handleSetGame() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      if (!this.form.uid || !this.form.type) {
        this.$message.error('请填写UID和类型')
        return
      }
      if (this.form.type !== 'GetConfig' && !this.form.sub1) {
        this.$message.error('请填写完整信息')
        return
      }
      this.isSubmitting = true
      this.responseData = null
      try {
        const params = {
          cmd: 'set',
          uid: this.form.uid,
          type: this.form.type,
          sub1: this.form.sub1
        }
        
        const config = { params }
        if (authKey) config.headers = { Authorization: authKey }
        
        const res = await axios.get(`${baseURL}/cdq/api`, config)
        
        this.responseData = res.data
        
        if (res.data.code === 0) {
          this.$message.success('操作成功')
        } else {
          this.$message.error('操作失败：' + (res.data.msg || '未知错误'))
        }
      } catch (error) {
        this.responseData = {
          code: -1,
          msg: error.response?.data?.message || error.message
        }
        this.$message.error('请求失败：' + this.responseData.msg)
      } finally {
        this.isSubmitting = false
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
      
      try {
        if (typeof this.responseData.msg === 'string') {
          const parsed = JSON.parse(this.responseData.msg)
          downloadData = JSON.stringify(parsed, null, 2)
          fileName = `game_setting_${this.form.uid}_${Date.now()}.json`
        } else {
          downloadData = JSON.stringify(this.responseData.msg, null, 2)
          fileName = `game_setting_${this.form.uid}_${Date.now()}.json`
        }
      } catch (error) {
        downloadData = this.responseData.msg
        fileName = `game_setting_${this.form.uid}_${Date.now()}.txt`
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
  max-width: 780px;
  margin: 20px auto;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}
.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.16);
}
.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
}
.submit-btn:hover {
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
/* 标题样式 */
:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 24px 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}
</style>
