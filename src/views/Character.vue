<template>
  <div class="page">
    <div class="function-card">
      <el-card shadow="hover">
        <h2>设置学生属性</h2>
        <el-form label-width="120px">
          <el-form-item label="老师UID">
            <el-input v-model="uid" placeholder="请输入老师的游戏UID"></el-input>
          </el-form-item>
          <el-form-item label="学生ID">
            <el-input v-model="id" placeholder="请输入学生ID" required></el-input>
          </el-form-item>

          <el-form-item label="一键满配">
            <el-switch
              v-model="max"
              active-text="开启"
              inactive-text="关闭"
              :active-value="1"
              :inactive-value="0"
            ></el-switch>
          </el-form-item>

          <!-- 当非一键满配时，显示各属性开关及对应输入框 -->
          <template v-if="max == 0">
            <el-form-item label="星级开关">
              <el-switch v-model="enableStar" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
            <el-form-item label="星级" v-if="enableStar">
              <el-input
                v-model.number="starGrade"
                type="number"
                placeholder="请输入星级"
              ></el-input>
            </el-form-item>

            <el-form-item label="等级开关">
              <el-switch v-model="enableLevel" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
            <el-form-item label="等级" v-if="enableLevel">
              <el-input v-model.number="level" type="number" placeholder="请输入等级"></el-input>
            </el-form-item>

            <el-form-item label="好感开关">
              <el-switch v-model="enableFavor" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
            <el-form-item label="好感" v-if="enableFavor">
              <el-input
                v-model.number="favorRank"
                type="number"
                placeholder="请输入好感值"
              ></el-input>
            </el-form-item>
          </template>

          <el-form-item>
            <el-button
              type="primary"
              @click="setCharacter"
              :loading="isSubmitting"
              class="submit-btn"
            >
              {{ isSubmitting ? '提交中...' : '提交请求' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div v-if="response" class="respond-card">
          <div class="respond-card-container">
            <div class="header">
              <img class="header-image" :src="banner1" alt="操作结果" />
            </div>
            <div class="body">
              <div class="message-box">
                <p class="message-text">老师！这是您的操作结果：</p>
                <p class="code">{{ response }}</p>
                <p class="message-text">请检查是否生效</p>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import banner1 from '@/assets/bg1.ccb168ef.jpg'

export default {
  name: 'Character',
  data() {
    return {
      uid: '',
      id: '',
      starGrade: null,
      level: null,
      favorRank: null,
      // 新增开关状态
      enableStar: false,
      enableLevel: false,
      enableFavor: false,
      max: 0,
      response: '',
      isSubmitting: false,
      banner1: banner1,
    }
  },
  methods: {
    async setCharacter() {
      const baseURL = localStorage.getItem('serverAddress')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      const authKey = localStorage.getItem('serverAuthKey')
      const headers = authKey ? { Authorization: authKey } : {}

      this.isSubmitting = true
      try {
        // 严格参数顺序构建
        const params = [
          `cmd=character`,
          `uid=${encodeURIComponent(this.uid)}`,
          `id=${encodeURIComponent(this.id)}`,
        ]

        if (this.max === 0) {
          const dynamicParams = [
            this.enableStar && this.starGrade !== null
              ? `starGrade=${encodeURIComponent(this.starGrade)}`
              : '',
            this.enableLevel && this.level !== null
              ? `level=${encodeURIComponent(this.level)}`
              : '',
            this.enableFavor && this.favorRank !== null
              ? `favorRank=${encodeURIComponent(this.favorRank)}`
              : '',
          ].filter(Boolean)
          params.push(...dynamicParams)
        }

        params.push(`max=${encodeURIComponent(this.max)}`)

        const url = `${baseURL}/cdq/api?${params.join('&')}`

        const res = await axios.get(url, { headers })
        if (res.data.code === 0) {
          this.response = JSON.stringify(res.data, null, 2)
          this.$message.success('操作成功')
        } else {
          this.response = res.data.msg
          this.$message.error('操作失败')
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
  border-radius: 5px 5px 0 0;
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

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  transition: transform 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.el-form-item:last-child {
  margin-top: 24px;
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
