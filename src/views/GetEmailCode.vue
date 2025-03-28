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

    <!-- 使用 transition 实现卡片上浮动画 -->
    <transition name="slide-up">
      <div v-if="emailCode || response" class="email-card">
        <div class="email-card-container">
          <div class="header">
            <img class="header-image" :src="banner1" alt="Header Image" />
          </div>
          <div class="body">
            <div class="message-box">
              <template v-if="emailCode">
                <p class="message-text">老师！这是您的邮箱验证码：</p>
                <p class="code">{{ emailCode }}</p>
                <p class="message-text">祝老师玩得愉快！</p>
              </template>
              <template v-else>
                <p class="message-text">老师！获取验证码异常，以下是异常信息：</p>
                <p class="code">{{ response }}</p>
                <p class="message-text">若多次提示验证码异常，请提交issues反馈</p>
              </template>
            </div>
            <div class="footer">
              <!-- <div class="copyright">
                Copyright © {{ currentYear }}<br />
                <a>KitanoSakura</a>. All Rights Reserved
              </div> -->
              <!-- <p class="description">若验证码失效请重新获取</p>
              <p class="more">有任何问题可前往 [关于] 进行获取联系方式反馈</p> -->
            </div>
          </div>
        </div>
      </div>
    </transition>
  </el-card>
</template>

<script>
import axios from 'axios'
import banner1 from '@/assets/bg1.ccb168ef.jpg' // 引入图片

export default {
  name: 'GetEmailCode',
  data() {
    return {
      form: {
        account: '',
      },
      response: '', // 用于存储错误提示信息
      isSubmitting: false,
      emailCode: '', // 存储验证码
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    banner1() {
      return banner1
    },
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
      // 清空上次的验证码和响应信息
      this.emailCode = ''
      this.response = ''
      try {
        const url = `${baseURL}/cdq/api?cmd=gec&account=${encodeURIComponent(this.form.account)}`
        let headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }
        const res = await axios.get(url, { headers })
        if (res.data.code === 0) {
          this.$message.success('获取验证码成功')
          // 提取验证码（数字）
          const match = res.data.msg.match(/(\d+)/)
          this.emailCode = match ? match[1] : res.data.msg
        } else {
          this.$message.error('获取验证码失败')
          // 提取 msg 字段作为错误提示
          this.response = res.data.msg
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message
        this.response = errMsg
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
  margin: 20px auto;
  margin-top: -9px;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.96);
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
  margin-top: 20px;
  border-radius: 8px;
}

/* 邮箱验证码卡片样式 */
.email-card {
  display: flex;
  align-items: center;
  padding: 8px;
  color: #666666;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
.email-card-container {
  overflow: hidden;
  width: 500px;
  margin: 0 auto;
  box-sizing: border-box;
  border: 1px solid #ee9ea8;
  box-shadow: 0 0 20px #cccccc;
  border-radius: 5px;
  background: #fff;
}
.header {
  position: relative;
}
.header-image {
  display: block;
  width: 100%;
}
.dear-box {
  display: inline-block;
  margin-left: 20px;
  padding: 7px 20px;
  background: #ee9ea8;
  color: #ffffff;
  text-align: center;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  position: absolute;
  top: 10px;
  left: 20px;
  transform: translateY(-20px);
}
.body {
  padding: 30px 20px;
}
.message-box {
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 20px auto;
}

.message-text {
  font-size: 16px;
  color: #333;
  margin: 10px 0;
}

.code {
  font-size: 18px;
  font-weight: bold;
  color: #ee9ea8;
  background: white;
  padding: 10px 20px;
  border-radius: 5px;
  display: inline-block;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.copyright {
  text-align: center;
  font-size: 12px;
  margin-bottom: 10px;
}
.description,
.more {
  margin: 0;
  padding: 0;
  line-height: 24px;
  font-size: 13px;
  color: #999999;
  text-align: center;
}

/* 卡片上浮动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
}
.slide-up-enter {
  transform: translateY(50px);
  opacity: 0;
}
.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.slide-up-leave {
  transform: translateY(0);
  opacity: 1;
}
.slide-up-leave-to {
  transform: translateY(50px);
  opacity: 0;
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
