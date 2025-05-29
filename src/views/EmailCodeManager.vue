<template>
  <el-card class="function-card" shadow="hover">
    <template #header>
      <h2>验证码管理</h2>
      <p>管理邮箱登录验证码，支持设置、获取、删除操作</p>
    </template>

    <el-form :model="form" label-width="100px" class="form-container">
      <el-form-item label="邮箱账户" required>
        <el-input
          v-model="form.account"
          placeholder="请输入邮箱账户"
          clearable
        >
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="操作类型" required>
        <el-select
          v-model="form.type"
          placeholder="请选择操作类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="option in typeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="form.type === 'set'"
        label="验证码"
        required
      >
        <el-input
          v-model.number="form.code"
          type="number"
          placeholder="请输入4-6位数字验证码"
          clearable
        >
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
        <div class="help-text">
          <el-icon><InfoFilled /></el-icon>
          <span>请输入4-6位数字验证码</span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!isFormValid"
          class="submit-btn"
        >
          <el-icon class="icon"><Operation /></el-icon>
          {{ getButtonText() }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 结果显示区域 -->
    <transition name="fade-slide">
      <div v-if="response || emailCode" class="respond-card">
        <div class="respond-card-container">
          <div class="header">
            <img class="header-image" :src="banner1" alt="操作结果" />
          </div>
          <div class="body">
            <div class="message-box">
              <template v-if="emailCode && form.type === 'get'">
                <p class="message-text">老师！这是您的邮箱验证码：</p>
                <div class="code-highlight">{{ emailCode }}</div>
                <p class="message-text">祝老师使用愉快！</p>
              </template>
              <template v-else>
                <p class="message-text">老师！这是您的操作结果：</p>
                <div class="code-container">
                  <pre class="code">{{ response }}</pre>
                </div>
                <p class="message-text">请检查是否生效</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </el-card>
</template>

<script>
import axios from 'axios'
import { Message, Key, Operation, InfoFilled } from '@element-plus/icons-vue'
import banner1 from '@/assets/bg1.ccb168ef.jpg'

export default {
  name: 'EmailCodeManager',
  components: {
    Message,
    Key,
    Operation,
    InfoFilled,
  },
  data() {
    return {
      form: {
        account: '',
        type: '',
        code: null,
      },
      typeOptions: [
        { value: 'set', label: '设置验证码' },
        { value: 'get', label: '获取验证码' },
        { value: 'del', label: '删除验证码' },
      ],
      response: '',
      emailCode: '',
      isSubmitting: false,
      banner1: banner1,
    }
  },
  computed: {
    isFormValid() {
      if (!this.form.account || !this.form.type) {
        return false
      }
      if (this.form.type === 'set' && (!this.form.code || this.form.code.toString().length < 4 || this.form.code.toString().length > 6)) {
        return false
      }
      return true
    },
  },
  methods: {
    getButtonText() {
      const textMap = {
        set: '设置验证码',
        get: '获取验证码',
        del: '删除验证码',
      }
      return textMap[this.form.type] || '执行操作'
    },

    handleTypeChange() {
      // 清除之前的结果
      this.response = ''
      this.emailCode = ''
      this.form.code = null
    },

    async handleSubmit() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      this.isSubmitting = true
      this.response = ''
      this.emailCode = ''

      try {
        // 构建请求参数
        const params = new URLSearchParams({
          cmd: 'emailCode',
          account: this.form.account,
          type: this.form.type,
        })

        // 如果是设置操作，添加验证码
        if (this.form.type === 'set' && this.form.code) {
          params.append('code', this.form.code.toString())
        }

        const headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }

        const res = await axios.get(`${baseURL}/cdq/api?${params.toString()}`, {
          headers,
        })

        if (res.data.code === 0) {
          this.$message.success('操作成功')
          
          // 如果是获取验证码操作，提取验证码数字
          if (this.form.type === 'get') {
            const match = res.data.msg.match(/(\d+)/)
            this.emailCode = match ? match[1] : res.data.msg
          } else {
            this.response = res.data.msg
          }
        } else {
          this.$message.error('操作失败')
          this.response = res.data.msg
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        this.response = `请求错误：${errorMsg}`
        this.$message.error(this.response)
        console.error(error)
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 680px;
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

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0;
  padding-bottom: 8px;
}

:deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 24px 24px 16px;
}

.form-container {
  padding: 24px;
}

.help-text {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.help-text .el-icon {
  margin-right: 6px;
  color: #409eff;
}

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.submit-btn .icon {
  margin-right: 8px;
}

/* 响应结果样式 */
.respond-card {
  margin-top: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.respond-card-container {
  position: relative;
}

.header {
  height: 120px;
  overflow: hidden;
  position: relative;
}

.header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}

.body {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.message-box {
  text-align: center;
}

.message-text {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-weight: 500;
  font-size: 16px;
}

.code-highlight {
  font-size: 24px;
  font-weight: bold;
  color: #ee9ea8;
  background: white;
  padding: 16px 32px;
  border-radius: 8px;
  display: inline-block;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  margin: 16px 0;
  letter-spacing: 2px;
}

.code-container {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  max-height: 300px;
  overflow-y: auto;
}

.code {
  color: #e6e6e6;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 