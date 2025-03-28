<template>
  <el-card class="function-card" shadow="hover">
    <h2>S.C.H.A.L.E 设置</h2>
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
        </el-select>
      </el-form-item>

      <!-- sub1 输入框 -->
      <el-form-item :label="sub1Label">
        <el-input
          v-model="form.sub1"
          :placeholder="sub1Placeholder"
          :type="form.type === 'AccountLevel' ? 'number' : 'text'"
          :disabled="!form.type"
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
    <div v-if="response" class="respond-card">
      <div class="respond-card-container">
        <div class="header">
          <img class="header-image" :src="banner1" alt="Header Image" />
        </div>
        <div class="body">
          <div class="message-box">
            <p class="message-text">老师！这是您的操作结果：</p>
            <p class="code">{{ response }}</p>
            <p class="message-text">请检查是否生效</p>
          </div>
          <!-- <div class="footer">
            <div class="copyright">
              Copyright © {{ currentYear }}<br />
              <a>KitanoSakura</a>. All Rights Reserved
            </div>
            <p class="description">如有问题请重新提交</p>
            <p class="more">有任何问题可前往 [关于] 进行反馈</p>
          </div> -->
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'
import banner1 from '@/assets/bg1.ccb168ef.jpg' // 引入图片

export default {
  name: 'SetGame',
  data() {
    return {
      form: {
        uid: '',
        type: '',
        sub1: '',
      },
      response: '',
      isSubmitting: false,
    }
  },
  computed: {
    // 获取当前年份
    currentYear() {
      return new Date().getFullYear()
    },
    // sub1 的标签
    sub1Label() {
      if (!this.form.type) return '无' // 未选择类型时显示 "无"
      return this.form.type === 'AccountLevel' ? '等级' : '通知'
    },
    // sub1 的占位符
    sub1Placeholder() {
      if (!this.form.type) {
        return '请选择类型'
      }
      return this.form.type === 'AccountLevel' ? '请输入玩家等级（数字）' : '请输入通知内容'
    },
    banner1() {
      return banner1
    },
  },
  methods: {
    handleTypeChange() {
      this.form.sub1 = '' // 切换类型时清空 sub1
    },
    async handleSetGame() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      if (!this.form.uid || !this.form.type || !this.form.sub1) {
        this.$message.error('请填写完整信息')
        return
      }
      this.isSubmitting = true
      this.response = ''
      try {
        const url = `${baseURL}/cdq/api?cmd=set&uid=${this.form.uid}&type=${this.form.type}&sub1=${encodeURIComponent(this.form.sub1)}`
        let headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }
        const res = await axios.get(url, { headers })
        if (res.data.code === 0) {
          this.$message.success('操作成功')
          this.response = res.data.msg
        } else {
          this.$message.error('操作失败')
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
.respond-card {
  display: flex;
  align-items: center;
  padding: 8px;
  color: #666;
  font-size: 14px;
}
.respond-card-container {
  width: 500px;
  margin: 0 auto;
  border: 1px solid #ee9ea8;
  box-shadow: 0 0 20px #ccc;
  border-radius: 5px;
  background: #fff;
}
.header-image {
  width: 100%;
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
.description,
.more {
  font-size: 13px;
  color: #999;
  text-align: center;
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
