<template>
  <el-card class="function-card" shadow="hover">
    <template #header>
      <div class="header-content">
        <h2>邮件管理</h2>
        <p>发送游戏内邮件或系统邮件到指定邮箱</p>
        
        <!-- 邮件类型切换 -->
        <div class="mail-type-switcher">
          <el-segmented v-model="mailType" :options="mailTypeOptions" size="large" />
        </div>
      </div>
    </template>

    <!-- 游戏邮件表单 -->
    <div v-if="mailType === 'game'" class="mail-form">
      <h3 class="form-title">
        <el-icon><Message /></el-icon>
        游戏内邮件
      </h3>
      <el-form :model="gameMailForm" label-width="120px">
        <!-- 邮件选项 -->
        <el-form-item label="邮件选项">
          <el-radio-group v-model="gameMailForm.player_type">
            <el-radio :label="0">全局邮件</el-radio>
            <el-radio :label="1">私人邮件</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- UID输入 -->
        <el-form-item v-if="gameMailForm.player_type === 1" label="UID">
          <el-input v-model="gameMailForm.uid" placeholder="请输入玩家UID">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 发件人 -->
        <el-form-item label="发件人">
          <el-input v-model="gameMailForm.sender" placeholder="请输入发件人名称">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 邮件内容 -->
        <el-form-item label="邮件内容">
          <el-input
            type="textarea"
            v-model="gameMailForm.comment"
            placeholder="请输入邮件内容"
            :rows="4"
          />
        </el-form-item>

        <!-- 时间设置 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="发送时间">
              <el-input-number
                v-model="gameMailForm.send_date"
                :min="0"
                placeholder="发送时间"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间">
              <el-input-number
                v-model="gameMailForm.expire_date"
                :min="0"
                placeholder="过期时间"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 附件列表 -->
        <el-form-item label="附件列表">
          <div class="help-text">
            <el-icon><InfoFilled /></el-icon>
            <span>请确保物品类型和ID的正确性。建议先到"获取物品列表"页面查看有效的物品ID</span>
          </div>
          <div class="attachment-list">
            <div v-for="(item, index) in gameMailForm.parcel_info_list" :key="index" class="attachment-item">
              <div class="attachment-header">
                <span class="attachment-title">附件 {{ index + 1 }}</span>
              </div>
              
              <div class="attachment-body">
                <div class="field-group">
                  <div class="field-label">类型</div>
                  <el-select
                    v-model="item.type"
                    placeholder="选择类型"
                    size="small"
                    class="type-select"
                  >
                    <el-option
                      v-for="option in typeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </div>

                <div class="field-group">
                  <div class="field-label">物品ID</div>
                  <el-input
                    v-model="item.id"
                    type="number"
                    placeholder="输入数字ID"
                    class="id-input"
                    size="small"
                  />
                </div>

                <div class="field-group">
                  <div class="field-label">数量</div>
                  <el-input
                    v-model.number="item.num"
                    type="number"
                    placeholder="输入数量"
                    :min="1"
                    class="num-input"
                    size="small"
                  />
                </div>

                <el-button
                  type="danger"
                  size="small"
                  circle
                  class="delete-btn"
                  @click="removeAttachment(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <el-button type="primary" size="small" class="add-btn" @click="addAttachment">
              <el-icon><Plus /></el-icon> 添加附件
            </el-button>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button class="submit-btn" type="primary" @click="handleGameMailSubmit" :loading="isSubmitting">
            <el-icon><Promotion /></el-icon>
            {{ isSubmitting ? '发送中...' : '发送游戏邮件' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 系统邮件表单 -->
    <div v-if="mailType === 'system'" class="mail-form">
      <h3 class="form-title">
        <el-icon><Promotion /></el-icon>
        系统邮件
      </h3>
      <el-form :model="systemMailForm" label-width="120px">
        <el-form-item label="邮件标题" required>
          <el-input
            v-model="systemMailForm.header"
            placeholder="请输入邮件标题"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮件内容" required>
          <el-input
            v-model="systemMailForm.body"
            type="textarea"
            :rows="6"
            placeholder="请输入邮件内容"
            clearable
          />
        </el-form-item>

        <el-form-item label="收件人" required>
          <el-input
            v-model="systemMailForm.usernames"
            placeholder="请输入收件人邮箱地址，多个邮箱用分号(;)分隔"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
          <div class="help-text">
            <el-icon><InfoFilled /></el-icon>
            <span>支持多个邮箱地址，请用分号(;)分隔，例如：user1@example.com;user2@example.com</span>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button class="submit-btn" type="primary" @click="handleSystemMailSubmit" :loading="isSubmitting">
            <el-icon><Promotion /></el-icon>
            {{ isSubmitting ? '发送中...' : '发送系统邮件' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

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
              <p class="message-text">请检查是否发送成功</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </el-card>
</template>

<script>
import axios from 'axios'
import { User, Message, Delete, Plus, QuestionFilled, InfoFilled, Promotion } from '@element-plus/icons-vue'
import banner1 from '@/assets/bg1.ccb168ef.jpg'

export default {
  name: 'MailManager',
  components: {
    User,
    Message,
    Delete,
    Plus,
    QuestionFilled,
    InfoFilled,
    Promotion,
  },
  data() {
    return {
      mailType: 'game',
      mailTypeOptions: [
        { label: '游戏邮件', value: 'game' },
        { label: '系统邮件', value: 'system' }
      ],
      
      // 游戏邮件表单
      gameMailForm: {
        player_type: 0,
        uid: '',
        sender: '系统管理员',
        comment: '',
        send_date: Math.floor(Date.now() / 1000),
        expire_date: Math.floor(Date.now() / 1000) + 604800,
        parcel_info_list: [],
      },
      
      // 系统邮件表单
      systemMailForm: {
        header: '',
        body: '',
        usernames: '',
      },
      
      typeOptions: [
        { value: 1, label: '学生' },
        { value: 2, label: '货币' },
        { value: 3, label: '装备' },
        { value: 4, label: '物品' },
        { value: 5, label: '卡池' },
        { value: 6, label: '商品' },
        { value: 7, label: '商店' },
        { value: 8, label: '记忆大厅' },
        { value: 9, label: '账号经验' },
        { value: 10, label: '学生经验' },
        { value: 11, label: '好感经验' },
        { value: 12, label: 'TSS' },
        { value: 13, label: '家具' },
        { value: 14, label: '商店刷新' },
        { value: 15, label: '地点经验' },
        { value: 16, label: '配方' },
        { value: 17, label: '学生武器' },
        { value: 18, label: '月度商品' },
        { value: 19, label: '学生装备' },
        { value: 20, label: '资料背景' },
        { value: 21, label: '徽章' },
        { value: 22, label: '贴纸' },
        { value: 23, label: '服饰' },
      ],
      response: '',
      isSubmitting: false,
      banner1: banner1,
    }
  },
  computed: {
    isGameMailFormValid() {
      // 基本信息验证
      if (!this.gameMailForm.sender || !this.gameMailForm.comment) {
        return false
      }
      
      // 私人邮件需要UID
      if (this.gameMailForm.player_type === 1 && !this.gameMailForm.uid) {
        return false
      }
      
      // 时间验证
      return this.gameMailForm.expire_date > this.gameMailForm.send_date;

    },
    
    isSystemMailFormValid() {
      return this.systemMailForm.header && this.systemMailForm.body && this.systemMailForm.usernames
    },
  },
  
  methods: {
    // 游戏邮件相关方法
    addAttachment() {
      this.gameMailForm.parcel_info_list.push({
        type: 1,
        id: '',
        num: 1,
      })
    },
    
    removeAttachment(index) {
      this.gameMailForm.parcel_info_list.splice(index, 1)
    },
    
    async handleGameMailSubmit() {
      if (!this.isGameMailFormValid) {
        this.$message.error('请填写完整的邮件信息')
        return
      }

      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      this.isSubmitting = true
      this.response = ''

      try {
        // 过滤空附件
        const validAttachments = this.gameMailForm.parcel_info_list.filter(item => 
          item.type && (item.id !== '' && item.id !== null) && item.num > 0
        )

        const params = {
          cmd: 'gameMail',
          player: parseInt(this.gameMailForm.player_type),
          sender: this.gameMailForm.sender.trim(),
          comment: this.gameMailForm.comment.trim(),
          sendDate: parseInt(this.gameMailForm.send_date),
          expireDate: parseInt(this.gameMailForm.expire_date),
          parcelInfoList: JSON.stringify(validAttachments.map(item => ({
            type: parseInt(item.type),
            id: parseInt(item.id),
            num: parseInt(item.num),
          }))),
        }

        // 私人邮件添加UID
        if (this.gameMailForm.player_type === 1) {
          params.uid = parseInt(this.gameMailForm.uid)
        }

        const headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }

        const res = await axios.get(`${baseURL}/cdq/api`, {
          params,
          headers,
        })

        if (res.data.code === 0) {
          this.$message.success('游戏邮件发送成功')
        } else {
          this.$message.error(`游戏邮件发送失败：${res.data.msg || '未知错误'}`)
        }
        this.response = res.data.msg
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        this.response = `请求错误：${errorMsg}`
        this.$message.error(this.response)
        console.error('游戏邮件发送错误:', error)
      } finally {
        this.isSubmitting = false
      }
    },
// 系统邮件相关方法
    async handleSystemMailSubmit() {
      if (!this.isSystemMailFormValid) {
        this.$message.error('请填写完整的邮件信息')
        return
      }

      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      // 验证邮箱格式
      const emails = this.systemMailForm.usernames.split(';').map(email => email.trim()).filter(email => email)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emails.filter(email => !emailRegex.test(email))
      
      if (invalidEmails.length > 0) {
        this.$message.error(`邮箱格式不正确: ${invalidEmails.join(', ')}`)
        return
      }

      this.isSubmitting = true
      this.response = ''

      try {
        const params = new URLSearchParams({
          cmd: 'mail',
          header: this.systemMailForm.header,
          body: this.systemMailForm.body,
          usernames: this.systemMailForm.usernames,
        })

        const headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }

        const res = await axios.get(`${baseURL}/cdq/api?${params.toString()}`, {
          headers,
        })

        if (res.data.code === 0) {
          this.$message.success('系统邮件发送成功')
        } else {
          this.$message.error('系统邮件发送失败')
        }
        this.response = res.data.msg
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
  
  watch: {
    mailType() {
      // 切换邮件类型时清除响应信息
      this.response = ''
    }
  }
}
</script>

<style scoped>
.function-card {
  max-width: 800px;
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

.header-content {
  text-align: center;
}

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.mail-type-switcher {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mail-form {
  padding: 24px;
}

.form-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f2f5;
}

.help-text {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* 附件列表样式 */
.attachment-list {
  width: 100%;
}

.attachment-item {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.attachment-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.attachment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.attachment-title {
  font-size: 14px;
  font-weight: 500;
}

.attachment-body {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 40px;
  align-items: center;
  gap: 8px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.type-select,
.id-input,
.num-input {
  width: 100%;
}

.delete-btn {
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.add-btn {
  width: 100%;
  margin-top: 12px;
  background: rgba(79, 172, 254, 0.05);
  border: 1px dashed #4facfe;
  color: #4facfe;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .function-card {
    margin: 20px;
    border-radius: 12px;
  }
  
  .attachment-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .delete-btn {
    justify-self: end;
  }
}

:deep(.el-segmented__item-selected) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-segmented__item) {
  position: relative !important;
  z-index: 1 !important;
  border: none !important;
  background: transparent !important;
  transition: all 0.3s ease !important;
  border-radius: 16px !important;
  margin: 0 !important;
}

:deep(.el-segmented__item:hover) {
  transform: scale(1.02) !important;
}

:deep(.el-segmented__item-input) {
  display: none !important;
}

:deep(.el-segmented__item.is-selected .el-segmented__item-label) {
  color: white !important;
  font-weight: 600 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-segmented__item:not(.is-selected) .el-segmented__item-label) {
  color: #6b7280 !important;
}

:deep(.el-segmented__item:not(.is-selected):hover .el-segmented__item-label) {
  color: #1b84d8 !important;
  background: rgba(79, 172, 254, 0.05) !important;
}
</style> 