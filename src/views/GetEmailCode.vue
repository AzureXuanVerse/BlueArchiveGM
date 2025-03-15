<template>
  <el-card class="function-card" shadow="hover">
    <h2>获取邮箱验证码</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="邮箱账户">
        <el-input v-model="form.account" placeholder="请输入邮箱账户"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          class="submit-btn"
          type="primary"
          @click="handleGetEmailCode"
          :loading="isSubmitting"
        >
          {{ isSubmitting ? '提交中...' : '提交' }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-alert
      v-if="response"
      title="响应"
      :type="responseType"
      :description="response"
      show-icon
      class="response-alert"
    ></el-alert>
  </el-card>
</template>

<script>
import axios from 'axios'
export default {
  name: 'GetEmailCode',
  data() {
    return {
      form: {
        account: '',
      },
      response: '',
      responseType: '', // success 或 error
      isSubmitting: false,
    }
  },
  methods: {
    async handleGetEmailCode() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      this.isSubmitting = true
      try {
        const url = `${baseURL}/cdq/api?cmd=gec&account=${encodeURIComponent(this.form.account)}`
        // 仅在 authKey 存在时添加 Authorization 请求头
        let headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }
        const res = await axios.get(url, {
          headers,
        })
        // 假设返回数据中 code 为 0 表示成功
        if (res.data.code === 0) {
          this.responseType = 'success'
          this.$message.success('获取验证码成功')
        } else {
          this.responseType = 'error'
          this.$message.error('获取验证码失败：' + (res.data.message || '请查看响应获取具体错误'))
        }
        this.response = JSON.stringify(res.data, null, 2)
      } catch (error) {
        this.responseType = 'error'
        this.response = '请求错误：' + (error.response?.data?.message || error.message)
        this.$message.error(this.response)
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 780px;
  margin: 40px auto;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
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

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin-bottom: 24px;
  padding-bottom: 12px;
  position: relative;
}

:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

:deep(.el-form-item__label) {
  color: #4a5568 !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
}

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4) !important;
}

.response-alert {
  border-radius: 8px;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.9) !important;
  margin-top: 20px;
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
/* 移动端样式适配 */
@media screen and (max-width: 768px) {
  .function-card {
    margin: 16px;
    padding: 16px !important; /* 覆盖 Element Plus 默认内边距 */
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9) !important;
  }


  /* 标题样式调整 */
  :deep(h2) {
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-bottom: 10px;
  }

  :deep(h2::after) {
    width: 40px;
    height: 2px;
  }

  /* 表单布局调整 */
  :deep(.el-form) {
    margin-top: 16px;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  /* 邮箱账户 */
  :deep(.el-form-item__label) {
    float: none !important;
    display: block;
    text-align: left !important;
    width: 70px !important;
    padding: 0 0 8px 0 !important;
    line-height: 40px !important;
    font-size: 1.0rem !important;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  /* 输入框样式优化 */
  :deep(.el-input__wrapper) {
    padding: 0 12px;
  }

  :deep(.el-input__inner) {
    height: 40px;
    font-size: 0.95rem;
  }

  /* 提交按钮样式调整 */
  .submit-btn {
    width: 100%;
    margin-top: 8px;
    padding: 10px 24px !important;
    font-size: 0.95rem;
    height: 40px;
  }

  /* 响应提示框样式调整 */
  .response-alert {
    margin-top: 16px;
    font-size: 0.9rem;
  }

  :deep(.el-alert__title) {
    font-size: 0.95rem;
  }

  :deep(.el-alert__description) {
    margin: 8px 0 0;
    font-size: 0.85rem;
    line-height: 1.5;
    word-break: break-word;
  }

  :deep(.el-alert__icon) {
    font-size: 16px;
  }

  /* 优化动画效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
}
</style>
