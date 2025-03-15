<template>
  <el-card class="function-card" shadow="hover">
    <h2>发送邮件</h2>
    <el-form :model="form" label-width="120px">
      <!-- 邮件选项 -->
      <el-form-item label="邮件选项">
        <el-radio-group v-model="form.player_type">
          <el-radio :label="0">全局</el-radio>
          <el-radio :label="1">私人</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- UID输入 -->
      <el-form-item v-if="form.player_type === 1" label="UID">
        <el-input v-model="form.uid" placeholder="请输入玩家UID">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 发件人 -->
      <el-form-item label="发件人">
        <el-input v-model="form.sender" placeholder="请输入发件人名称">
          <template #prefix>
            <el-icon><Message /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 邮件内容 -->
      <el-form-item label="邮件内容">
        <el-input
          type="textarea"
          v-model="form.comment"
          placeholder="请输入邮件内容"
          :rows="4"
        ></el-input>
      </el-form-item>

      <!-- 时间设置 -->
      <el-form-item label="发送时间">
        <el-input-number
          v-model="form.send_date"
          :min="0"
          placeholder="发送时间"
          controls-position="right"
          class="time-input"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="过期时间">
        <el-input-number
          v-model="form.expire_date"
          :min="0"
          placeholder="过期时间"
          controls-position="right"
          class="time-input"
        ></el-input-number>
      </el-form-item>

      <!-- 新版附件列表 -->
      <el-form-item label="附件列表">
        <div class="attachment-list">
          <div v-for="(item, index) in form.parcel_info_list" :key="index" class="attachment-card">
            <div class="attachment-content">
              <!-- 类型选择 -->
              <div class="field-group">
                <div class="field-label">
                  附件类型
                  <el-tooltip content="选择附件类型（0表示无类型附件）" placement="top">
                    <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <el-select v-model="item.type" placeholder="必填" size="small" class="type-select">
                  <el-option
                    v-for="option in typeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>

              <div class="field-group">
                <div class="field-label">
                  物品ID
                  <el-tooltip content="输入游戏内物品ID（0表示无特定物品）" placement="top">
                    <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <el-input
                  v-model.number="item.id"
                  type="number"
                  placeholder="输入数字ID"
                  :min="0"
                  class="id-input"
                  size="small"
                />
              </div>

              <!-- 数量 -->
              <div class="field-group">
                <div class="field-label">
                  数量
                  <el-tooltip content="必须大于等于0的整数" placement="top">
                    <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <el-input
                  v-model.number="item.num"
                  type="number"
                  placeholder="输入数量"
                  :min="0"
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
        <el-button class="submit-btn" type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isSubmitting ? '提交中...' : '发送邮件' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 响应提示 -->
    <el-alert
      v-if="response"
      :title="responseSuccess ? '发送成功' : '发送失败'"
      :type="responseSuccess ? 'success' : 'error'"
      :description="responseData"
      show-icon
      class="response-alert"
    ></el-alert>
  </el-card>
</template>

<script>
import axios from 'axios'
import { User, Message, Delete, Plus, QuestionFilled } from '@element-plus/icons-vue'

export default {
  name: 'MailSender',
  data() {
    return {
      form: {
        player_type: 0,
        uid: '',
        sender: '系统管理员',
        comment: '',
        send_date: Math.floor(Date.now() / 1000),
        expire_date: Math.floor(Date.now() / 1000) + 604800, // 默认7天
        parcel_info_list: [],
      },
      typeOptions: [
        { value: 0, label: '无' },
        { value: 1, label: '学生' },
        { value: 2, label: '货币' },
        { value: 3, label: '装备' },
        { value: 4, label: '物品' },
        { value: 5, label: '卡池' },
        { value: 6, label: '商品' },
        { value: 7, label: '商店' },
        { value: 8, label: '记忆大厅' },
        { value: 9, label: '账号经验' },
        { value: 10, label: '角色经验' },
        { value: 11, label: '好感经验' },
        { value: 12, label: 'TSS' },
        { value: 13, label: '家具' },
        { value: 14, label: '商店刷新' },
        { value: 15, label: '地点经验' },
        { value: 16, label: '配方' },
        { value: 17, label: '角色武器' },
        { value: 18, label: '月度商品' },
        { value: 19, label: '角色装备' },
        { value: 20, label: '资料背景' },
        { value: 21, label: '徽章' },
        { value: 22, label: '贴纸' },
        { value: 23, label: '服饰' },
      ],
      isSubmitting: false,
      response: false,
      responseSuccess: false,
      responseData: '',
    }
  },
  methods: {
    addAttachment() {
      this.form.parcel_info_list.push({
        type: 0,
        id: 0,
        num: 0,
      })
    },
    removeAttachment(index) {
      this.form.parcel_info_list.splice(index, 1)
    },
    validateForm() {
      // 验证所有附件（允许类型为0的任意值）
      const invalidAttachments = this.form.parcel_info_list.filter((item) => {
        if (item.type === 0) return false
        return item.id <= 0 || item.num <= 0
      })

      if (invalidAttachments.length > 0) {
        this.$message.error('存在无效的附件配置，请检查')
        return false
      }

      if (this.form.player_type === 1 && !this.form.uid) {
        this.$message.error('私人邮件必须填写UID')
        return false
      }

      return true
    },
    async handleSubmit() {
      if (!this.validateForm()) return

      this.isSubmitting = true
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')

      try {
        const params = {
          cmd: 'm',
          player: this.form.player_type,
          sender: this.form.sender,
          comment: this.form.comment,
          send_date: this.form.send_date,
          expire_date: this.form.expire_date,
          parcel_info_list: JSON.stringify(
            this.form.parcel_info_list.map((item) => ({
              type: item.type,
              id: Number(item.id),
              num: Number(item.num),
            })),
          ),
        }

        if (this.form.player_type === 1) params.uid = this.form.uid

        // 仅在 authKey 存在时添加 Authorization 请求头
        let headers = {}
        if (authKey) {
          headers.Authorization = authKey
        }

        const res = await axios.get(`${baseURL}/cdq/api`, {
          params,
          headers,
        })

        this.response = true
        this.responseSuccess = res.data.code === 0
        this.responseData = JSON.stringify(res.data, null, 2)
      } catch (error) {
        this.response = true
        this.responseSuccess = false
        this.responseData = error.response?.data?.message || error.message
      } finally {
        this.isSubmitting = false
      }
    },
  },
  components: {
    User,
    Message,
    Delete,
    Plus,
    QuestionFilled,
  },
}
</script>

<style scoped>
/* 保留原附件列表所有样式 */
.attachment-list {
  width: 100%;
}

.attachment-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.attachment-card:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.attachment-content {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 40px;
  gap: 12px;
  align-items: center;
}

.type-select {
  width: 100%;
}

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
  background: rgba(59, 130, 246, 0.05);
  border: 1px dashed #3b82f6;
  color: #3b82f6;
}

/* 以下为新增的美化部分（不涉及附件列表） */
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

/* 修改前缀图标样式，去掉默认的小框框 */
:deep(.el-input__prefix) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  transition: all 0.3s ease;
  border-radius: 8px !important;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: #4facfe !important;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2) !important;
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
/* 移动端适配 */
@media (max-width: 768px) {
  /* 提交按钮优化 */
  :deep(.el-form-item__content) {
    display: flex;
    justify-content: space-around;
    margin-left: 0 !important;
  }
  :deep(.el-form-item) {
    display: flex;
    flex-direction: column;
  }

  :deep(.el-form-item__label) {
    text-align: left !important;
    width: auto !important;
    margin-bottom: 8px;
    justify-content: space-around;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
  .attachment-content {
    display: grid;
    grid-template-columns: 1fr !important; /* 改为单列布局 */
    gap: 16px !important;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    text-align: left;
    margin-bottom: 4px;
  }

  /* 删除按钮调整 */
  .delete-btn {
    width: 100%;
    margin-top: 8px;
  }

  /* 输入框和选择框占满宽度 */
  .type-select,
  .id-input,
  .num-input {
    width: 100% !important;
  }
  .delete-btn {
    width: 44px !important; /* 设置固定宽度 */
    height: 44px !important; /* 设置固定高度 */
    padding: 0 !important; /* 移除内边距 */
    margin: 8px auto !important; /* 上下间距8px，左右自动居中 */
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .delete-btn .el-icon {
    font-size: 20px !important; /* 调整图标大小 */
    margin: 0 !important; /* 移除图标的margin */
  }
}
</style>
