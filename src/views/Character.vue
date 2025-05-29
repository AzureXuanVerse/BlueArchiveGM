<template>
  <el-card class="function-card" shadow="hover">
    <div class="card-header">
      <h2>学生数值设置</h2>
      <p class="description">设置指定学生的星级、等级、好感度等属性数值</p>
    </div>

    <el-form :model="form" :rules="rules" ref="characterForm" label-width="120px" class="character-form">
      <!-- 基础信息 -->
      <div class="form-section">
        <h3 class="section-title">
          <el-icon><User /></el-icon>
          基础信息
        </h3>
        
        <el-form-item label="老师UID" prop="uid">
          <el-input 
            v-model="form.uid" 
            placeholder="请输入老师的游戏UID"
            @input="form.uid = form.uid.replace(/\D/g, '')"
          >
            <template #prefix>
              <el-icon><UserFilled /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="学生ID" prop="id">
          <div class="student-id-input-group">
            <el-input 
              v-model="form.id" 
              placeholder="请输入学生ID或从列表中选择"
              @input="form.id = form.id.replace(/\D/g, '')"
            >
              <template #prefix>
                <el-icon><Avatar /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              @click="showStudentSelector = true"
              style="margin-left: 8px;"
              class="select-student-btn"
            >
              <el-icon><List /></el-icon>
              选择学生
            </el-button>
          </div>
        </el-form-item>
      </div>

      <!-- 配置模式选择 -->
      <div class="form-section">
        <h3 class="section-title">
          <el-icon><Setting /></el-icon>
          配置模式
        </h3>
        
        <el-form-item label="配置模式">
          <el-radio-group v-model="form.configMode" @change="handleModeChange" class="config-mode-group">
            <el-radio-button value="max">一键满配</el-radio-button>
            <el-radio-button value="custom">自定义配置</el-radio-button>
          </el-radio-group>
          <div class="help-text">
            <el-icon><InfoFilled /></el-icon>
            <span>一键满配将所有属性设置为最大值，自定义配置可单独设置每个属性</span>
          </div>
        </el-form-item>
      </div>

      <!-- 自定义配置 -->
      <div v-if="form.configMode === 'custom'" class="form-section">
        <h3 class="section-title">
          <el-icon><Tools /></el-icon>
          属性设置
        </h3>

        <!-- 星级设置 -->
        <el-form-item label="星级设置">
          <div class="attribute-group">
            <el-switch 
              v-model="form.starEnabled" 
              active-text="启用" 
              inactive-text="禁用"
              style="margin-right: 16px;"
            />
            <el-input-number
              v-if="form.starEnabled"
              v-model="form.starGrade"
              :min="1"
              :max="5"
              placeholder="1-5星"
              style="width: 120px; margin-right: 16px;"
            />
            <div v-if="form.starEnabled" class="quick-buttons">
              <el-button 
                v-for="star in [1,2,3,4,5]" 
                :key="star"
                size="small" 
                @click="form.starGrade = star"
                :type="form.starGrade === star ? 'primary' : ''"
                class="quick-btn"
              >
                {{ star }}星
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 等级设置 -->
        <el-form-item label="等级设置">
          <div class="attribute-group">
            <el-switch 
              v-model="form.levelEnabled" 
              active-text="启用" 
              inactive-text="禁用"
              style="margin-right: 16px;"
            />
            <el-input-number
              v-if="form.levelEnabled"
              v-model="form.level"
              :min="1"
              :max="90"
              placeholder="1-90级"
              style="width: 120px; margin-right: 16px;"
            />
            <div v-if="form.levelEnabled" class="quick-buttons">
              <el-button 
                v-for="level in [50, 80, 90]" 
                :key="level"
                size="small" 
                @click="form.level = level"
                :type="form.level === level ? 'primary' : ''"
                class="quick-btn"
              >
                {{ level }}级
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 好感度设置 -->
        <el-form-item label="好感度设置">
          <div class="attribute-group">
            <el-switch 
              v-model="form.favorEnabled" 
              active-text="启用" 
              inactive-text="禁用"
              style="margin-right: 16px;"
            />
            <el-input-number
              v-if="form.favorEnabled"
              v-model="form.favorRank"
              :min="1"
              :max="50"
              placeholder="1-50级"
              style="width: 120px; margin-right: 16px;"
            />
            <div v-if="form.favorEnabled" class="quick-buttons">
              <el-button 
                v-for="favor in [10, 20, 30, 50]" 
                :key="favor"
                size="small" 
                @click="form.favorRank = favor"
                :type="form.favorRank === favor ? 'primary' : ''"
                class="quick-btn"
              >
                {{ favor }}级
              </el-button>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <el-form-item>
        <div class="action-buttons">
          <el-button 
            class="submit-btn" 
            type="primary" 
            @click="handleSubmit"
            :loading="isSubmitting"
          >
            <el-icon><Check /></el-icon>
            {{ isSubmitting ? '设置中...' : '应用设置' }}
          </el-button>
          <el-button @click="resetForm">
            <el-icon><RefreshLeft /></el-icon>
            重置表单
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 结果展示 -->
    <div v-if="response" class="result-display">
      <div class="result-header">
        <h3>
          <el-icon><SuccessFilled v-if="isSuccess" /><CircleCloseFilled v-else /></el-icon>
          操作结果
        </h3>
        <el-button 
          size="small" 
          @click="copyResult" 
          :icon="DocumentCopy"
        >
          复制结果
        </el-button>
      </div>
      
      <div class="result-content">
        <el-input
          v-model="response"
          type="textarea"
          :rows="8"
          readonly
          class="result-textarea"
        />
      </div>
      
      <div class="result-footer">
        <div class="result-info">
          <el-icon><InfoFilled /></el-icon>
          <span>操作时间: {{ operationTime }}</span>
        </div>
      </div>
    </div>

    <!-- 学生选择器弹窗 -->
    <el-dialog
      v-model="showStudentSelector"
      title="选择学生"
      width="700px"
      :close-on-click-modal="false"
      class="student-selector-dialog"
      :modal-class="'student-modal-overlay'"
    >
      <div class="student-selector">
        <!-- 搜索框 -->
        <el-input
          v-model="studentSearchQuery"
          placeholder="搜索学生姓名或ID"
          class="student-search"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 学生列表 -->
        <div v-if="isLoadingStudents" class="loading-students">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>正在加载学生数据...</p>
        </div>

        <div v-else class="student-list">
          <div
            v-for="student in filteredStudents"
            :key="student.Id"
            class="student-item"
            @click="selectStudent(student)"
          >
            <div class="student-avatar">
              <img 
                v-if="student.Icon" 
                :src="student.Icon" 
                :alt="student.Name"
                @error="handleStudentImageError"
              />
              <el-icon v-else><Avatar /></el-icon>
            </div>
            <div class="student-info">
              <div class="student-name">{{ student.Name || student.PersonalName || '未知学生' }}</div>
              <div class="student-details">
                <span class="student-id">ID: {{ student.Id }}</span>
                <span v-if="student.School" class="student-school">{{ student.School }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty 
          v-if="!isLoadingStudents && filteredStudents.length === 0"
          description="没有找到匹配的学生"
          :image-size="80"
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showStudentSelector = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import axios from 'axios'
import { 
  User, 
  UserFilled, 
  Avatar, 
  Setting, 
  Tools, 
  InfoFilled, 
  QuestionFilled, 
  Check, 
  RefreshLeft, 
  SuccessFilled, 
  CircleCloseFilled,
  DocumentCopy,
  List,
  Search,
  Loading
} from '@element-plus/icons-vue'

export default {
  name: 'Character',
  components: {
    User,
    UserFilled,
    Avatar,
    Setting,
    Tools,
    InfoFilled,
    QuestionFilled,
    Check,
    RefreshLeft,
    SuccessFilled,
    CircleCloseFilled,
    DocumentCopy,
    List,
    Search,
    Loading
  },
  data() {
    return {
      form: {
        uid: '',
        id: '',
        configMode: 'max', // 'max' 或 'custom'
        starEnabled: false,
        starGrade: 5,
        levelEnabled: false,
        level: 90,
        favorEnabled: false,
        favorRank: 50,
      },
      rules: {
        uid: [
          { required: true, message: '请输入老师UID', trigger: 'blur' },
          { pattern: /^\d+$/, message: 'UID只能包含数字', trigger: 'blur' }
        ],
        id: [
          { required: true, message: '请输入学生ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '学生ID只能包含数字', trigger: 'blur' }
        ]
      },
      response: '',
      isSubmitting: false,
      isSuccess: false,
      operationTime: '',
      showStudentSelector: false,
      studentSearchQuery: '',
      isLoadingStudents: false,
      studentsData: [],
    }
  },
  computed: {
    filteredStudents() {
      if (!this.studentsData.length) return []
      
      if (!this.studentSearchQuery.trim()) {
        return this.studentsData
      }
      
      const query = this.studentSearchQuery.toLowerCase()
      return this.studentsData.filter(student => {
        const name = (student.Name || student.PersonalName || '').toLowerCase()
        const id = String(student.Id || '')
        return name.includes(query) || id.includes(query)
      })
    }
  },
  methods: {
    handleModeChange(mode) {
      if (mode === 'max') {
        // 切换到一键满配时，重置自定义配置
        this.form.starEnabled = false
        this.form.levelEnabled = false
        this.form.favorEnabled = false
      }
    },

    async handleSubmit() {
      // 表单验证
      try {
        await this.$refs.characterForm.validate()
      } catch {
        this.$message.error('请检查表单输入')
        return
      }

      // 自定义模式下检查是否至少选择了一个属性
      if (this.form.configMode === 'custom') {
        if (!this.form.starEnabled && !this.form.levelEnabled && !this.form.favorEnabled) {
          this.$message.warning('请至少启用一个属性设置')
          return
        }
      }

      const baseURL = localStorage.getItem('serverAddress')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }

      const authKey = localStorage.getItem('serverAuthKey')
      const headers = authKey ? { Authorization: authKey } : {}

      this.isSubmitting = true
      this.response = ''

      try {
        const params = {
          cmd: 'character',
          uid: this.form.uid,
          id: this.form.id,
          max: this.form.configMode === 'max' ? 1 : 0
        }

        // 自定义模式下添加具体属性
        if (this.form.configMode === 'custom') {
          if (this.form.starEnabled) {
            params.starGrade = this.form.starGrade
          }
          if (this.form.levelEnabled) {
            params.level = this.form.level
          }
          if (this.form.favorEnabled) {
            params.favorRank = this.form.favorRank
          }
        }

        const res = await axios.get(`${baseURL}/cdq/api`, {
          params,
          headers
        })

        if (res.data.code === 0) {
          this.response = JSON.stringify(res.data, null, 2)
          this.isSuccess = true
          this.operationTime = new Date().toLocaleString()
          this.$message.success('学生属性设置成功')
        } else {
          this.response = res.data.msg || '设置失败，请检查参数'
          this.isSuccess = false
          this.operationTime = new Date().toLocaleString()
          this.$message.error('设置失败')
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        this.response = `请求错误：${errorMsg}`
        this.isSuccess = false
        this.operationTime = new Date().toLocaleString()
        this.$message.error('请求失败，请检查网络连接')
        console.error('设置错误:', error)
      } finally {
        this.isSubmitting = false
      }
    },

    resetForm() {
      this.$refs.characterForm.resetFields()
      this.form = {
        uid: '',
        id: '',
        configMode: 'max',
        starEnabled: false,
        starGrade: 5,
        levelEnabled: false,
        level: 90,
        favorEnabled: false,
        favorRank: 50,
      }
      this.response = ''
      this.$message.info('表单已重置')
    },

    async copyResult() {
      try {
        await navigator.clipboard.writeText(this.response)
        this.$message.success('结果已复制到剪贴板')
      } catch (error) {
        this.$message.error('复制失败，请手动选择复制')
      }
    },

    async fetchStudents() {
      this.isLoadingStudents = true
      try {
        // 导入学生数据
        const studentsData = await import('@/assets/students.json')
        
        // 动态加载图标
        let icons = {}
        try {
          icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
        } catch (error) {
          console.warn('Failed to load icons:', error)
        }

        // 处理学生数据
        this.studentsData = studentsData.default.map(student => {
          const iconPath = `/src/assets/icon/${student.Id}.png`
          return {
            ...student,
            Icon: icons[iconPath]?.default || ''
          }
        })

      } catch (error) {
        this.studentsData = []
        this.$message.error('获取学生列表失败')
        console.error('获取学生数据失败:', error)
      } finally {
        this.isLoadingStudents = false
      }
    },

    selectStudent(student) {
      this.form.id = student.Id
      this.showStudentSelector = false
      this.$message.success(`已选择学生：${student.Name || student.PersonalName || '未知学生'} (ID: ${student.Id})`)
    },

    handleStudentImageError(event) {
      event.target.style.display = 'none'
      // 显示默认图标
      const iconElement = event.target.parentElement.querySelector('.el-icon')
      if (iconElement) {
        iconElement.style.display = 'block'
      }
    },
  },
  watch: {
    showStudentSelector(val) {
      if (val && !this.studentsData.length) {
        this.fetchStudents()
      }
    }
  }
}
</script>

<style scoped>
.function-card {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

:deep(.el-card__body) {
  padding: 2rem;
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

:deep(.el-card__body:hover) {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

/* 卡片头部 */
.card-header {
  margin-bottom: 32px;
}

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  position: relative;
}

:deep(h2::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
}

.description {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 表单样式 */
.character-form {
  margin-bottom: 32px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(249, 250, 251, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #3b82f6;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
  line-height: 1.5;
}

.help-text {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.help-text .el-icon {
  margin-right: 6px;
  margin-top: 1px;
  color: #3b82f6;
  flex-shrink: 0;
}

/* 属性组样式 */
.attribute-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-buttons .el-button {
  font-size: 12px;
  padding: 4px 12px;
}

/* 配置模式按钮组样式 */
:deep(.config-mode-group .el-radio-button__inner) {
  border-radius: 8px !important;
  border: none !important;
  background: #f3f4f6 !important;
  color: #374151 !important;
  font-weight: 500 !important;
  padding: 8px 20px !important;
  margin-right: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.config-mode-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
  transform: translateY(-1px) !important;
}

:deep(.config-mode-group .el-radio-button__inner:hover) {
  background: #e5f3ff !important;
  color: #4facfe !important;
  transform: translateY(-1px) !important;
}

/* 快捷按钮样式 */
.quick-btn {
  border-radius: 6px !important;
  border: none !important;
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.quick-btn:hover {
  color: #3b82f6 !important;
  background: #eff6ff !important;
  transform: translateY(-1px) !important;
}

:deep(.quick-btn.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 12px 32px !important;
  font-weight: 600;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

/* 结果展示 */
.result-display {
  margin-top: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(249, 250, 251, 0.8);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid #e5e7eb;
}

.result-header h3 {
  display: flex;
  align-items: center;
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.result-header h3 .el-icon {
  margin-right: 8px;
  color: #10b981;
}

.result-content {
  padding: 20px;
}

.result-textarea {
  font-family: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
}

:deep(.result-textarea .el-textarea__inner) {
  background: #1e1e1e !important;
  color: #e6e6e6 !important;
  border: 1px solid #374151 !important;
  border-radius: 8px !important;
  font-size: 13px;
  line-height: 1.5;
  padding: 16px !important;
}

.result-footer {
  border-top: 1px solid #e5e7eb;
  background: rgba(249, 250, 251, 0.9);
}

.result-info {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.result-info .el-icon {
  margin-right: 8px;
  color: #3b82f6;
  flex-shrink: 0;
}

/* 学生ID输入组 */
.student-id-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.student-id-input-group .el-input {
  flex: 1;
}

.select-student-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  padding: 8px 16px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  color: white !important;
}

.select-student-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4) !important;
}

.select-student-btn .el-icon {
  margin-right: 6px;
}

/* 学生选择器弹窗样式 */
:deep(.student-selector-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-overlay-dialog) {
  top: 0 !important;
  overflow: hidden !important;
}

:deep(.student-selector-dialog .el-dialog__header) {
  background: #ffffff;
  color: #1f2937;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.student-selector-dialog .el-dialog__title) {
  color: #1f2937;
  font-weight: 600;
  font-size: 18px;
}

:deep(.student-selector-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #6b7280;
  font-size: 20px;
}

:deep(.student-selector-dialog .el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

:deep(.student-modal-overlay) {
  background: transparent;
}

.student-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 搜索框样式 */
.student-search {
  margin: 20px 24px 16px 24px;
}

:deep(.student-search .el-input__inner) {
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
}

:deep(.student-search .el-input__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 加载状态 */
.loading-students {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #6b7280;
}

.loading-students .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: #667eea;
}

/* 学生列表 */
.student-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 20px 24px;
  max-height: 400px;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.student-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.student-item:last-child {
  margin-bottom: 0;
}

/* 学生头像 */
.student-avatar {
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-avatar .el-icon {
  font-size: 24px;
  color: #9ca3af;
  display: none;
}

/* 学生信息 */
.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}

.student-id {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}

.student-school {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

/* 对话框底部 */
.dialog-footer {
  padding: 16px 24px;
  background: rgba(249, 250, 251, 0.8);
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  display: flex;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
}

/* 滚动条样式 */
.student-list::-webkit-scrollbar {
  width: 6px;
}

.student-list::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 0.8);
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.8);
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.8);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .function-card {
    margin: 20px;
    border-radius: 12px;
  }
  
  .form-section {
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .attribute-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-buttons {
    margin-top: 8px;
  }
  
  .result-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 16px;
  }
  
  .result-content {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .function-card {
    margin: 16px;
  }
  
  .card-header {
    margin-bottom: 24px;
  }
  
  .quick-buttons .el-button {
    flex: 1;
    min-width: auto;
  }
}
</style>
