<template>
  <el-card class="function-card" shadow="hover">
    <h2>邮件发送系统</h2>

    <!-- 邮件类型选择 -->
    <el-form :model="form" :rules="rules" ref="mailForm" label-width="120px">
      <el-form-item label="邮件类型">
        <el-radio-group v-model="mailType" @change="handleMailTypeChange">
          <el-radio-button value="simple">用户邮件</el-radio-button>
          <el-radio-button value="game">游戏邮件</el-radio-button>
        </el-radio-group>
        <div class="help-text">
          <span v-if="mailType === 'simple'">适用于发送简单文本邮件给多个用户</span>
          <span v-else>适用于发送带附件的游戏内邮件，支持全局和私人邮件</span>
        </div>
      </el-form-item>

      <!-- 全局邮件警告提示 - 只在游戏邮件模式下显示 -->
      <div v-if="shouldShowGlobalWarning" class="warning-banner">
        <el-icon><Warning /></el-icon>
        <span>注意：全局邮件的更新涉及数据库读写，请勿频繁大量使用</span>
      </div>

      <!-- 用户邮件模式 -->
      <template v-if="mailType === 'simple'">
        <el-form-item label="邮件标题" prop="header">
          <el-input v-model="form.header" placeholder="请输入邮件标题">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮件内容" prop="body">
          <el-input
            type="textarea"
            v-model="form.body"
            placeholder="请输入邮件内容"
            :rows="4"
          ></el-input>
        </el-form-item>

        <el-form-item label="接收者列表">
          <div class="attachment-list">
            <div v-for="(user, idx) in form.usernames" :key="idx" class="attachment-card simple-user">
              <el-input
                v-model="form.usernames[idx]"
                placeholder="请输入接收者邮箱或用户名"
                size="small"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
              <el-button
                type="danger"
                size="small"
                circle
                class="delete-btn"
                @click="removeUser(idx)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" size="small" class="add-btn" @click="addUser">
              <el-icon><Plus /></el-icon> 添加接收者
            </el-button>
          </div>
        </el-form-item>
      </template>

      <!-- 游戏邮件模式 -->
      <template v-else>
        <el-form-item label="操作类型">
          <el-radio-group v-model="mailOperation" @change="handleOperationChange">
            <el-radio-button value="send">发送邮件</el-radio-button>
            <el-radio-button value="delete">删除邮件</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 删除邮件模式 -->
        <template v-if="mailOperation === 'delete'">
          <el-form-item label="删除范围">
            <el-radio-group v-model="form.delete_scope">
              <el-radio :label="0">全局邮件</el-radio>
              <el-radio :label="1">玩家邮件</el-radio>
            </el-radio-group>
            <div class="help-text">
              <span v-if="form.delete_scope === 0">删除所有玩家的邮件（全服范围）</span>
              <span v-else>删除指定玩家的邮件</span>
            </div>
          </el-form-item>

          <el-form-item v-if="form.delete_scope === 1" label="玩家UID" prop="uid">
            <el-input v-model="form.uid" placeholder="请输入玩家UID">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="删除选项">
            <el-radio-group v-model="form.delete_type">
              <el-radio value="all">删除全部邮件</el-radio>
              <el-radio value="specific">删除指定邮件</el-radio>
            </el-radio-group>
            <div class="help-text">
              <span v-if="form.delete_type === 'all'">删除该范围内的所有邮件</span>
              <span v-else>只删除指定ID的邮件</span>
            </div>
          </el-form-item>

          <el-form-item v-if="form.delete_type === 'specific'" label="邮件ID">
            <el-input-number 
              v-model="form.mail_id" 
              placeholder="请输入要删除的邮件ID"
              :min="1"
              :controls="false"
              style="width: 100%"
            />
            <div class="help-text">
              输入具体的邮件ID进行精确删除
            </div>
          </el-form-item>


        </template>

        <!-- 发送邮件模式 -->
        <template v-else>
          <el-form-item label="邮件选项" prop="player_type">
            <el-radio-group v-model="form.player_type">
              <el-radio :label="0">全局邮件</el-radio>
              <el-radio :label="1">私人邮件</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.player_type === 1" label="玩家UID" prop="uid">
            <el-input v-model="form.uid" placeholder="请输入玩家UID">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="发件人" prop="sender">
            <el-input v-model="form.sender" placeholder="请输入发件人名称">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="邮件内容" prop="comment">
            <el-input
              type="textarea"
              v-model="form.comment"
              placeholder="请输入邮件内容"
              :rows="4"
            ></el-input>
          </el-form-item>

          <el-form-item label="发送时间" prop="send_date">
            <div class="time-selector">
              <input
                type="date"
                v-model="sendDateOnly"
                @change="updateSendDateTime"
                class="native-date-input"
              />
              <input
                type="time"
                v-model="sendTimeOnly"
                @change="updateSendDateTime"
                class="native-time-input"
              />
              <div class="quick-buttons">
                <el-button size="small" type="primary" plain @click="setSendTimeNow">现在</el-button>
                <el-button size="small" type="success" plain @click="setSendTimeMorning">明天9点</el-button>
              </div>
            </div>
            <div class="time-preview">{{ formatDisplayTime(form.send_date) }}</div>
          </el-form-item>

          <el-form-item label="过期时间" prop="expire_date">
            <div class="time-selector">
              <input
                type="date"
                v-model="expireDateOnly"
                @change="updateExpireDateTime"
                class="native-date-input"
              />
              <input
                type="time"
                v-model="expireTimeOnly"
                @change="updateExpireDateTime"
                class="native-time-input"
              />
              <div class="quick-buttons">
                <el-button size="small" type="warning" plain @click="setExpireTime7Days">7天后</el-button>
                <el-button size="small" type="danger" plain @click="setExpireTimeNever">永不过期</el-button>
              </div>
            </div>
            <div class="time-preview">{{ formatDisplayTime(form.expire_date) }}</div>
          </el-form-item>

          <el-form-item label="附件列表">
            <div class="attachment-list">
              <div v-for="(item, index) in form.parcel_info_list" :key="index" class="attachment-card">
                <div class="attachment-content">
                  <div class="field-group">
                    <div class="field-label">
                      附件类型
                      <el-tooltip content="选择附件类型（无=不发送具体物品，ID和数量将自动设为0）" placement="top">
                        <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </div>
                    <el-select 
                      v-model="item.type" 
                      placeholder="必填" 
                      size="small" 
                      class="type-select"
                      @change="handleTypeChange(item, index)"
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
                    <div class="field-label">
                      物品ID
                      <el-tooltip content="输入游戏内物品ID（必须是有效的物品ID，类型为无时固定为0且不可修改）" placement="top">
                        <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </div>
                    <el-input-number
                      v-model.number="item.id"
                      :disabled="item.type === 0"
                      class="id-input"
                      size="small"
                      :placeholder="item.type === 0 ? '类型为无时固定为0' : '请输入物品ID'"
                    />
                  </div>
                  <div class="field-group">
                    <div class="field-label">
                      数量
                      <el-tooltip content="必须大于等于0的整数，最大99999（类型为无时固定为0且不可修改）" placement="top">
                        <el-icon class="tip-icon"><QuestionFilled /></el-icon>
                      </el-tooltip>
                    </div>
                    <el-input-number
                      v-model.number="item.num"
                      :min="0"
                      :max="99999999"
                      :disabled="item.type === 0"
                      class="num-input"
                      size="small"
                      :placeholder="item.type === 0 ? '类型为无时固定为0' : '请输入数量'"
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
        </template>
      </template>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button class="submit-btn" type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ getSubmitButtonText() }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 响应卡片 -->
    <div v-if="response" class="respond-card">
      <div class="respond-card-container">
        <div class="header">
          <img class="header-image" :src="banner" alt="操作结果" />
        </div>
        <div class="body">
          <div class="message-box">
            <p class="message-text">{{ getResponseMessage() }}</p>
            <p class="code">{{ response }}</p>
            <p class="message-text">请检查操作是否成功</p>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'
import { Delete, Plus, Message, Document, QuestionFilled, Warning } from '@element-plus/icons-vue'
import banner from '@/assets/images/bg1.ccb168ef.jpg'

// 导入JSON数据用于ID验证
import characterData from '@/assets/json/id/CharacterExcelTable.json'
import currencyData from '@/assets/json/id/CurrencyExcel.json'
import equipmentData from '@/assets/json/id/EquipmentExcelTable.json'
import itemData from '@/assets/json/id/ItemExcelTable.json'
import memoryLobbyData from '@/assets/json/id/MemoryLobbyExcel.json'
import furnitureData from '@/assets/json/id/FurnitureExcelTable.json'
import idCardBackgroundData from '@/assets/json/id/IdCardBackgroundExcel.json'
import emblemData from '@/assets/json/id/EmblemExcel.json'
import stickerData from '@/assets/json/id/StickerPageContentExcel.json'

export default {
  name: 'MailSystem',
  components: { Delete, Plus, Message, Document, QuestionFilled, Warning },
  data() {
    return {
      mailType: 'simple',
      mailOperation: 'send',
      form: {
        header: '',
        body: '',
        usernames: [''],
        player_type: 0,
        uid: '',
        sender: '系统管理员',
        comment: '',
        send_date: Math.floor(Date.now() / 1000),
        expire_date: Math.floor(Date.now() / 1000) + 604800, // 7天后过期
        parcel_info_list: [],
        delete_scope: 0,
        delete_type: 'all',
        mail_id: null,
      },
      typeOptions: [
        { value: 0, label: '无' },
        { value: 1, label: '角色' },
        { value: 2, label: '货币' },
        { value: 3, label: '装备' },
        { value: 4, label: '道具' },
        // { value: 5, label: '抽卡组' }, // 暂无对应JSON数据
        // { value: 6, label: '产品' }, // 暂无对应JSON数据
        // { value: 7, label: '商店' }, // 暂无对应JSON数据
        { value: 8, label: '记忆大厅' },
        // { value: 9, label: '账户经验' }, // 暂无对应JSON数据
        // { value: 10, label: '角色经验' }, // 暂无对应JSON数据
        // { value: 11, label: '好感度经验' }, // 暂无对应JSON数据
        // { value: 12, label: 'TSS系统' }, // 暂无对应JSON数据
        { value: 13, label: '家具' },
        // { value: 14, label: '商店刷新' }, // 暂无对应JSON数据
        // { value: 15, label: '位置经验' }, // 暂无对应JSON数据
        // { value: 16, label: '配方' }, // 暂无对应JSON数据
        // { value: 17, label: '角色武器' }, // 暂无对应JSON数据
        // { value: 18, label: '角色装备' }, // 暂无对应JSON数据
        { value: 19, label: '身份卡背景' },
        { value: 20, label: '徽章' },
        { value: 21, label: '贴纸' },
        // { value: 22, label: '服装' } // 暂无对应JSON数据
      ],
      rules: {
        header: [{ required: true, message: '请输入邮件标题', trigger: 'blur' }],
        body: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
        sender: [{ required: true, message: '请输入发件人', trigger: 'blur' }],
        comment: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
        send_date: [{ type: 'number', required: true, message: '请选择发送时间', trigger: 'change' }],
        expire_date: [{ type: 'number', required: true, message: '请选择过期时间', trigger: 'change' }],
        uid: [
          {
            required: true,
            message: '私人邮件必须填写UID',
            trigger: 'blur'
          }
        ],
      },
      isSubmitting: false,
      response: '',
      banner,
      sendDateOnly: '',
      sendTimeOnly: '',
      expireDateOnly: '',
      expireTimeOnly: '',
      lastGlobalMailTime: 0, // 上次全局邮件时间
    }
  },
  computed: {
    shouldShowGlobalWarning() {
      if (this.mailType !== 'game') return false

      // 发送邮件模式：选择全局邮件时显示
      if (this.mailOperation === 'send') {
        return this.form.player_type === 0
      }

      // 删除邮件模式：选择删除全局邮件时显示
      if (this.mailOperation === 'delete') {
        return this.form.delete_scope === 0
      }

      return false
    }
  },
  created() {
    // 初始化发送时间为当前时间
    const now = new Date()
    this.sendDateOnly = now.toISOString().split('T')[0]
    this.sendTimeOnly = now.toTimeString().substr(0, 5)
    this.form.send_date = Math.floor(now.getTime() / 1000)

    // 初始化过期时间为7天后
    const expire = new Date()
    expire.setDate(expire.getDate() + 7)
    this.expireDateOnly = expire.toISOString().split('T')[0]
    this.expireTimeOnly = '23:59'
    this.form.expire_date = Math.floor(expire.getTime() / 1000)
  },
  methods: {
    handleMailTypeChange() {
      // 切换邮件类型时重置表单
      this.response = ''
      if (this.mailType === 'simple') {
        this.form.usernames = ['']
      } else {
        this.form.parcel_info_list = []
      }
    },

    // 用户邮件方法
    addUser() {
      this.form.usernames.push('')
    },
    removeUser(idx) {
      if (this.form.usernames.length > 1) {
        this.form.usernames.splice(idx, 1)
      }
    },

    // 游戏邮件方法
    addAttachment() {
      this.form.parcel_info_list.push({ type: 0, id: 0, num: 0 })
    },
    removeAttachment(index) {
      this.form.parcel_info_list.splice(index, 1)
    },
    handleTypeChange(item, index) {
      // 当附件类型改为"无"(0)时，自动将ID和数量都设置为0
      if (item.type === 0) {
        item.id = 0
        item.num = 0
        this.$message.info('附件类型为"无"时，ID和数量已自动设置为0')
      }
    },

    // 验证附件配置是否有效
    validateAttachment(type, id, num) {
      // 类型0(无)时，ID和数量都必须为0
      if (type === 0) {
        return id === 0 && num === 0
      }
      
      // 验证ID是否为有效数字（只检查是否为整数）
      if (!Number.isInteger(id)) {
        return false
      }
      
      // 验证数量是否为有效数字
      if (!Number.isInteger(num) || num <= 0 || num > 99999999) {
        return false
      }
      
      // 验证ID是否存在于对应的数据表中
      let dataList = []
      switch (type) {
        case 1: // 角色
          dataList = characterData
          break
        case 2: // 货币
          dataList = currencyData
          break
        case 3: // 装备
          dataList = equipmentData
          break
        case 4: // 道具
          dataList = itemData
          break
        case 8: // 记忆大厅
          dataList = memoryLobbyData
          break
        case 13: // 家具
          dataList = furnitureData
          break
        case 19: // 身份卡背景
          dataList = idCardBackgroundData
          break
        case 20: // 徽章
          dataList = emblemData
          break
        case 21: // 贴纸
          dataList = stickerData
          break
        default:
          return false // 未知类型不允许通过
      }
      
      return dataList.some(item => item.Id === id || item.ID === id)
    },

    // 验证所有附件配置
    validateAllAttachments() {
      for (let i = 0; i < this.form.parcel_info_list.length; i++) {
        const attachment = this.form.parcel_info_list[i]
        const typeName = this.typeOptions.find(opt => opt.value === attachment.type)?.label || '未知类型'
        
        // 验证所有类型的附件，包括类型0(无)
        if (!this.validateAttachment(attachment.type, attachment.id, attachment.num)) {
          if (attachment.type === 0) {
            this.$message.error(`第${i + 1}个附件类型为"无"时，ID和数量都必须为0`)
          } else {
            // this.$message.error(`第${i + 1}个附件的ID ${attachment.id} 在${typeName}数据中不存在，请检查`)
            this.$message.error(`第${i + 1}个附件的ID ${attachment.id} 不存在，请查询物品列表获取正确ID`)
          }
          return false
        }
      }
      return true
    },

    // 检查全局邮件操作频率限制
    checkGlobalMailLimit() {
      const now = Date.now()
      const timeDiff = now - this.lastGlobalMailTime
      if (timeDiff < 5000) {
        const waitTime = Math.ceil((5000 - timeDiff) / 1000)
        this.$message.error(`全局邮件操作过于频繁，请等待 ${waitTime} 秒`)
        return false
      }
      return true
    },

    async handleSubmit() {
      // 根据邮件类型进行不同的验证和提交
      if (this.mailType === 'simple') {
        await this.submitSimpleMail()
      } else {
        if (this.mailOperation === 'send') {
          await this.submitGameMail()
        } else {
          await this.submitDeleteMail()
        }
      }
    },

    async submitSimpleMail() {
      // 简单校验
      if (!this.form.header || !this.form.body) {
        this.$message.error('标题和内容不能为空')
        return
      }
      if (this.form.usernames.some((u) => !u.trim())) {
        this.$message.error('存在空的接收者，请检查')
        return
      }

      this.isSubmitting = true
      try {
        const params = {
          cmd: 'mail',
          header: this.form.header,
          body: this.form.body,
          usernames: this.form.usernames.join(';'),
        }

        const baseURL = localStorage.getItem('serverAddress')
        const authKey = localStorage.getItem('serverAuthKey')
        let config = { params }
        if (authKey) config.headers = { Authorization: authKey }

        const res = await axios.get(`${baseURL}/cdq/api`, config)
        if (res.data.code === 0) {
          this.$message.success('系统邮件发送成功')
        } else {
          this.$message.error('发送失败')
        }
        this.response = res.data.msg
      } catch (err) {
        const msg = err.response?.data?.message || err.message
        this.$message.error(msg)
        this.response = msg
      } finally {
        this.isSubmitting = false
      }
    },

    async submitGameMail() {
      // 全局邮件频率限制检查
      if (this.form.player_type === 0 && !this.checkGlobalMailLimit()) {
        return
      }

      // 验证附件ID
      if (!this.validateAllAttachments()) {
        return
      }

      this.$refs.mailForm.validate(async (valid) => {
        if (!valid) return

        this.isSubmitting = true
        try {
          const baseURL = localStorage.getItem('serverAddress')
          const authKey = localStorage.getItem('serverAuthKey')

          const params = {
            cmd: 'gameMail',
            recipient: this.form.player_type === 0 ? 'all' : this.form.uid,
            sender: this.form.sender,
            comment: this.form.comment,
            sendDate: this.form.send_date.toString(),
            expireDate: this.form.expire_date.toString(),
            parcelInfoList: JSON.stringify(
              this.form.parcel_info_list.map((item) => ({
                type: item.type,
                id: item.id,
                num: item.num,
              })),
            ),
          }

          let config = { params }
          if (authKey) config.headers = { Authorization: authKey }

          const res = await axios.get(`${baseURL}/cdq/api`, config)
          
          if (res.data.code === 0) {
            this.$message.success('游戏邮件发送成功')
            // 更新全局邮件发送时间
            if (this.form.player_type === 0) {
              this.lastGlobalMailTime = Date.now()
            }
          } else {
            this.$message.error('发送失败')
          }
          
          this.response = res.data.msg
        } catch (err) {
          const msg = err.response?.data?.message || err.message
          this.$message.error(msg)
          this.response = msg
        } finally {
          this.isSubmitting = false
        }
      })
    },

    async submitDeleteMail() {
      // 全局邮件频率限制检查
      if (this.form.delete_scope === 0 && !this.checkGlobalMailLimit()) {
        return
      }

      // 表单验证
      if (this.form.delete_scope === 1 && !this.form.uid) {
        this.$message.error('删除玩家邮件必须填写UID')
        return
      }

      if (this.form.delete_type === 'specific' && !this.form.mail_id) {
        this.$message.error('删除指定邮件必须填写邮件ID')
        return
      }

      this.isSubmitting = true
      try {
        const baseURL = localStorage.getItem('serverAddress')
        const authKey = localStorage.getItem('serverAuthKey')

        // 根据API文档构建删除邮件参数
        const params = {
          cmd: 'gameMail',
          recipient: this.form.delete_scope === 0 ? 'all' : this.form.uid,
          del: this.form.delete_type === 'all' ? 'all' : parseInt(this.form.mail_id),
        }

        let config = { params }
        if (authKey) config.headers = { Authorization: authKey }

        const res = await axios.get(`${baseURL}/cdq/api`, config)
        
        if (res.data.code === 0) {
          this.$message.success('邮件删除成功')
          // 更新全局邮件操作时间
          if (this.form.delete_scope === 0) {
            this.lastGlobalMailTime = Date.now()
          }
        } else {
          this.$message.error(`删除失败: ${res.data.msg || '未知错误'}`)
        }
        
        this.response = res.data.msg
      } catch (err) {
        const msg = err.response?.data?.message || err.message
        this.$message.error(`请求失败: ${msg}`)
        this.response = msg
      } finally {
        this.isSubmitting = false
      }
    },

    updateDateTime(dateField, timeField, targetField) {
      if (this[dateField] && this[timeField]) {
        const [hours, minutes] = this[timeField].split(':')
        const date = new Date(this[dateField])
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        this.form[targetField] = Math.floor(date.getTime() / 1000)
      }
    },

    updateSendDateTime() {
      this.updateDateTime('sendDateOnly', 'sendTimeOnly', 'send_date')
    },

    updateExpireDateTime() {
      this.updateDateTime('expireDateOnly', 'expireTimeOnly', 'expire_date')
    },

    setTime(dateField, timeField, targetField, date, time) {
      this[dateField] = date.toISOString().split('T')[0]
      this[timeField] = time
      this.updateDateTime(dateField, timeField, targetField)
    },

    setSendTimeNow() {
      const now = new Date()
      this.setTime('sendDateOnly', 'sendTimeOnly', 'send_date', now, now.toTimeString().substring(0, 5))
    },

    setSendTimeMorning() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      this.setTime('sendDateOnly', 'sendTimeOnly', 'send_date', tomorrow, '09:00')
    },

    setExpireTime7Days() {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      this.setTime('expireDateOnly', 'expireTimeOnly', 'expire_date', date, '23:59')
    },

    setExpireTimeNever() {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 100)
      this.setTime('expireDateOnly', 'expireTimeOnly', 'expire_date', date, '23:59')
    },

    formatDisplayTime(timestamp) {
      if (!timestamp) return '未设置'
      return new Date(timestamp * 1000).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    handleOperationChange() {
      // 切换操作类型时重置响应信息
      this.response = ''
      // 重置删除相关的表单字段
      this.form.delete_scope = 0
      this.form.delete_type = 'all'
      this.form.mail_id = null
    },

    getSubmitButtonText() {
      if (this.isSubmitting) {
        return '提交中...'
      }

      if (this.mailType === 'simple') {
        return '发送邮件'
      } else {
        if (this.mailOperation === 'send') {
          return '发送邮件'
        } else {
          return '删除邮件'
        }
      }
    },

    getResponseMessage() {
      if (this.mailType === 'simple') {
        return '老师！邮件发送结果：'
      } else {
        if (this.mailOperation === 'send') {
          return '老师！游戏邮件发送结果：'
        } else {
          return '老师！邮件删除结果：'
        }
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

.help-text {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

:deep(.el-form-item__label) {
  color: #4a5568 !important;
  font-weight: 500 !important;
}

/* 基础组件样式 - 这些选择器都在Element Plus组件中使用 */
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

:deep(.el-radio-button__inner) {
  border-radius: 8px !important;
  border: none !important;
  background: #f3f4f6 !important;
  color: #374151 !important;
  font-weight: 500 !important;
  padding: 8px 20px !important;
  margin-right: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
  transform: translateY(-1px) !important;
}

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4) !important;
}

/* 附件列表样式 */
.attachment-list {
  width: 100%;
}

.attachment-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.attachment-card:hover {
  transform: translateX(2px);
}

.simple-user {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}

.attachment-content {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 40px;
  gap: 12px;
  align-items: center;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-btn {
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

/* 响应卡片样式 */
.respond-card {
  margin-top: 24px;
}

.respond-card-container {
  width: 500px;
  margin: 0 auto;
  border: 1px solid #ee9ea8;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 0 20px #ccc;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .function-card {
    margin: 20px;
  }

  .attachment-content {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* 时间选择器样式 */
.time-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.time-preview {
  font-size: 14px;
  font-weight: 500;
  color: #4facfe;
  padding: 8px 12px;
  background: rgba(79, 172, 254, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(79, 172, 254, 0.2);
  text-align: center;
  width: 100%;
}

.quick-buttons {
  display: flex;
  gap: 6px;
}

.quick-buttons .el-button {
  font-size: 11px !important;
  padding: 4px 12px !important;
  border-radius: 16px !important;
  transition: all 0.2s ease !important;
}

.quick-buttons .el-button:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1) !important;
}

.native-date-input,
.native-time-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 140px;
}

.native-date-input:focus,
.native-time-input:focus {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.warning-banner {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);
  animation: slideIn 0.3s ease-out;
}

.warning-banner .el-icon {
  font-size: 16px;
  color: #ef4444;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>