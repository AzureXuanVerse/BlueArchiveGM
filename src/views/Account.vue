<template>
  <el-card class="function-card" shadow="hover">
    <h2>账户操作</h2>
    <div class="tips-section">
      <el-alert 
        title="提示：输入你注册的邮箱进行账户查询和管理"
        type="info" 
        show-icon 
        :closable="false"
        class="account-tips"
      />
    </div>
    <el-form :model="form" label-width="120px">
      <!-- 注册邮箱 -->
      <el-form-item label="注册邮箱">
        <el-input v-model="form.name" placeholder="请输入注册邮箱" type="email" />
      </el-form-item>

      <!-- 操作类型 -->
      <el-form-item label="操作类型">
        <el-select v-model="form.opType" placeholder="请选择操作类型">
          <el-option label="查询详情" value="getAccount">
            <span>查询详情</span>
            <span style="float: right; color: #8492a6; font-size: 13px">获取完整账户信息</span>
          </el-option>
<!--          <el-option label="注册账户" value="login">-->
<!--            <span>注册账户</span>-->
<!--            <span style="float: right; color: #8492a6; font-size: 13px">创建新账户</span>-->
<!--          </el-option>-->
          <el-option label="封禁账户" value="ban">
            <span>封禁账户</span>
            <span style="float: right; color: #8492a6; font-size: 13px">禁止账户登录</span>
          </el-option>
          <el-option label="解除封禁" value="unban">
            <span>解除封禁</span>
            <span style="float: right; color: #8492a6; font-size: 13px">恢复账户正常状态</span>
          </el-option>
          <el-option label="设置验证码" value="setCode">
            <span>设置验证码</span>
            <span style="float: right; color: #8492a6; font-size: 13px">为账户设置邮箱验证码</span>
          </el-option>
          <el-option label="获取验证码" value="getCode">
            <span>获取验证码</span>
            <span style="float: right; color: #8492a6; font-size: 13px">查询当前验证码</span>
          </el-option>
          <el-option label="删除验证码" value="delCode">
            <span>删除验证码</span>
            <span style="float: right; color: #8492a6; font-size: 13px">清除账户验证码</span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 封禁原因 (仅封禁时) -->
      <el-form-item v-if="form.opType === 'ban'" label="封禁原因">
        <el-input type="textarea" v-model="form.banMsg" placeholder="请输入封禁原因" :rows="2" />
      </el-form-item>

      <!-- 验证码 (仅设置验证码时) -->
      <el-form-item v-if="form.opType === 'setCode'" label="验证码">
        <el-input-number 
          v-model="form.code" 
          placeholder="请输入6位数字验证码" 
          :min="100000"
          :max="999999"
          :controls="false"
          style="width: 100%"
        />
        <div class="help-text" style="margin-top: 4px; font-size: 12px; color: #666;">
          请输入6位数字验证码，用于邮箱验证
        </div>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button class="submit-btn" type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isSubmitting ? '提交中...' : '执行操作' }}
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
  name: 'AccountManager',
  components: { 
    Document, DocumentCopy, Download, DataAnalysis, 
    WarningFilled 
  },
  data() {
    return {
      form: {
        name: '',
        opType: 'getAccount',
        banMsg: '',
        code: null,
      },
      isSubmitting: false,
      responseData: null,
    }
  },
  computed: {
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
    async handleSubmit() {
      // 校验必填
      if (!this.form.name || !this.form.opType) {
        this.$message.error('注册邮箱和操作类型为必填项')
        return
      }
      // ban 时校验原因
      if (this.form.opType === 'ban' && !this.form.banMsg) {
        this.$message.error('请填写封禁原因')
        return
      }
      // setCode 时校验验证码
      if (this.form.opType === 'setCode' && !this.form.code) {
        this.$message.error('请输入验证码')
        return
      }

      this.isSubmitting = true
      try {
        const params = {
          cmd: 'account',
          account: this.form.name,
          type: this.form.opType,
        }
        if (this.form.opType === 'ban') {
          params.banMsg = this.form.banMsg
        }
        if (this.form.opType === 'setCode') {
          params.code = this.form.code
        }

        const baseURL = localStorage.getItem('serverAddress')
        const authKey = localStorage.getItem('serverAuthKey')
        const config = { params }
        if (authKey) config.headers = { Authorization: authKey }

        const res = await axios.get(`${baseURL}/cdq/api`, config)
        
        this.responseData = res.data
        
        if (res.data.code === 0) {
          this.$message.success('操作成功')
        } else {
          this.$message.error('操作失败：' + (res.data.msg || '未知错误'))
        }
      } catch (err) {
        this.responseData = {
          code: -1,
          msg: err.response?.data?.message || err.message
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
          fileName = `account_${this.form.name}_${Date.now()}.json`
        } else {
          downloadData = JSON.stringify(this.responseData.msg, null, 2)
          fileName = `account_${this.form.name}_${Date.now()}.json`
        }
      } catch (error) {
        downloadData = this.responseData.msg
        fileName = `account_${this.form.name}_${Date.now()}.txt`
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
/* 通用功能卡片 */
.function-card {
  max-width: 780px;
  margin: 40px auto;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 12px 40px -12px rgba(0, 0, 0, 0.12),
    0 4px 24px -4px rgba(0, 0, 0, 0.08),
    inset 0 0 12px rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}
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

.tips-section {
  margin-bottom: 24px;
}

.account-tips {
  border-radius: 8px;
  border: 1px solid rgba(79, 172, 254, 0.2);
  background: rgba(79, 172, 254, 0.05);
}

:deep(.account-tips .el-alert__icon) {
  color: #4facfe;
}

:deep(.account-tips .el-alert__title) {
  color: #2c3e50;
  font-weight: 500;
}

.el-form-item__label {
  color: #4a5568;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.el-input__inner,
.el-input-number__input,
.el-textarea__inner,
.el-select {
  border-radius: 8px;
  transition: all 0.3s ease;
}
.el-input__inner:focus,
.el-input-number__input:focus,
.el-textarea__inner:focus,
.el-select:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}
.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none;
  padding: 12px 32px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4);
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
  .function-card {
    margin: 20px;
    border-radius: 12px;
  }
  :deep(h2) {
    font-size: 1.5rem;
  }
}
</style>
