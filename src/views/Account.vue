<template>
  <el-card class="function-card" shadow="hover">
    <template #header>
      <h2>账户管理</h2>
      <p>管理玩家账户，包括注册、封禁、解封等操作</p>
    </template>

    <el-form :model="form" label-width="100px" class="form-container">
      <el-form-item label="账户昵称" required>
        <el-input
          v-model="form.name"
          placeholder="请输入账户昵称"
          clearable
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="操作类型" required>
        <el-select
          v-model="form.type"
          placeholder="请选择操作类型"
          style="width: 100%"
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
        v-if="form.type === 'ban'"
        label="封禁原因"
        required
      >
        <el-input
          v-model="form.banMsg"
          type="textarea"
          :rows="3"
          placeholder="请输入封禁原因"
          clearable
        />
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
      <div v-if="response" class="respond-card">
        <div class="respond-card-container">
          <div class="header">
            <img class="header-image" :src="banner1" alt="操作结果" />
          </div>
          <div class="body">
            <div class="message-box">
              <p class="message-text">老师！这是您的操作结果：</p>
              <div class="code-container">
                <pre class="code">{{ response }}</pre>
              </div>
              <p class="message-text">请检查是否生效</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </el-card>
</template>

<script>
import axios from 'axios'
import { User, Operation } from '@element-plus/icons-vue'
import banner1 from '@/assets/bg1.ccb168ef.jpg'

export default {
  name: 'Account',
  components: {
    User,
    Operation,
  },
  data() {
    return {
      form: {
        name: '',
        type: '',
        banMsg: '',
      },
      typeOptions: [
        { value: 'login', label: '注册新账户' },
        { value: 'ban', label: '封禁账户' },
        { value: 'unban', label: '解封账户' },
        { value: 'get', label: '获取账户详情' },
      ],
      response: '',
      isSubmitting: false,
      banner1: banner1,
    }
  },
  computed: {
    isFormValid() {
      if (!this.form.name || !this.form.type) {
        return false
      }
      if (this.form.type === 'ban' && !this.form.banMsg) {
        return false
      }
      return true
    },
  },
  methods: {
    getButtonText() {
      const textMap = {
        login: '注册账户',
        ban: '封禁账户',
        unban: '解封账户',
        get: '获取详情',
      }
      return textMap[this.form.type] || '执行操作'
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

      try {
        // 构建请求参数
        const params = new URLSearchParams({
          cmd: 'account',
          name: this.form.name,
          type: this.form.type,
        })

        // 如果是封禁操作，添加封禁原因
        if (this.form.type === 'ban' && this.form.banMsg) {
          params.append('banMsg', this.form.banMsg)
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
          // 如果是获取账户详情，格式化显示结果
          if (this.form.type === 'get') {
            try {
              const data = JSON.parse(res.data.msg)
              this.response = JSON.stringify(data, null, 2)
            } catch {
              this.response = res.data.msg
            }
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