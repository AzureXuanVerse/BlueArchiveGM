<template>
  <el-card class="function-card" shadow="hover">
    <h2>获取老师信息（开发中）</h2>
    <el-form :model="form" label-width="100px">
      <el-form-item label="老师UID">
        <el-input v-model="form.uid" placeholder="请输入老师的UID">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="二进制输出">
        <el-switch v-model="form.bin" active-value="1" inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button class="gradient-button" type="primary" @click="handleGetPlayer">提交</el-button>
      </el-form-item>
    </el-form>
    <p>目前只会输出数据包内容，暂时还没做（懒喵~）</p>
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
import { User } from '@element-plus/icons-vue'
export default {
  name: 'GetPlayer',
  components: { User },
  data() {
    return {
      form: {
        uid: '',
        bin: '0',
      },
      response: '',
      responseType: '', // 'success' 或 'error'
    }
  },
  methods: {
    async handleGetPlayer() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        const url = `${baseURL}/cdq/api?cmd=gp&uid=${this.form.uid}&bin=${this.form.bin}`
        // 仅在 authKey 存在时添加 Authorization 请求头
        let headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }
        const res = await axios.get(url, {
          headers,
        })
        // 根据返回结果判断成功与否，这里假设 res.data.code === 0 表示成功
        if (res.data.code === 0) {
          this.responseType = 'success'
          this.$message.success('获取玩家信息成功')
        } else {
          this.responseType = 'error'
          this.$message.error('获取玩家信息失败：' + (res.data.message || '请查看响应获取具体错误'))
        }
        this.response = JSON.stringify(res.data, null, 2)
      } catch (error) {
        this.responseType = 'error'
        const errorMsg = error.response?.data?.message || error.message
        this.response = errorMsg
        this.$message.error(this.response)
      }
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 680px;
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

h2 {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 24px 24px;
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

.response-alert {
  margin-top: 20px;
  border-radius: 8px;
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
</style>
