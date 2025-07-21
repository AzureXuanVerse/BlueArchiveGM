<template>
  <div class="character-container">
    <el-card shadow="hover" class="character-card">
      <h2>设置学生属性</h2>
      <el-form label-width="120px">
        <el-form-item label="老师UID">
          <el-input v-model="uid" placeholder="请输入老师的游戏UID"></el-input>
        </el-form-item>

        <el-form-item label="操作模式">
          <el-radio-group v-model="operationMode">
            <el-radio-button label="single">单个学生</el-radio-button>
            <el-radio-button label="batch">批量操作</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="operationMode === 'single'" label="学生ID">
          <div class="student-id-input-group">
            <el-input v-model="id" placeholder="请输入学生ID" required></el-input>
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

        <el-form-item v-else label="批量选择">
          <div class="student-id-input-group">
            <el-input
              v-model="displaySelectedStudents"
              placeholder="请选择学生"
              readonly
            />
            <el-button
              type="primary"
              @click="showStudentSelector = true"
              style="margin-left: 8px;"
              class="select-student-btn"
            >
              <el-icon><List /></el-icon>
              批量选择
            </el-button>
          </div>
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
        <template v-if="max === 0">
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
            @click="handleSubmit"
            :loading="isSubmitting"
            class="submit-btn"
            :disabled="!canSubmit"
          >
            {{ getSubmitButtonText() }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作进度 -->
      <div v-if="batchProgress.show" class="batch-progress">
        <div class="progress-header">
          <h3>批量操作进度</h3>
          <el-button size="small" type="danger" @click="cancelBatch = true">取消操作</el-button>
        </div>
        <el-progress
          :percentage="batchProgress.percentage"
          :status="batchProgress.status"
          :stroke-width="8"
        >
          <span>{{ batchProgress.current }} / {{ batchProgress.total }}</span>
        </el-progress>
        <div class="progress-details">
          <p>当前处理: {{ batchProgress.currentStudent }}</p>
          <p>成功: {{ batchProgress.success }} | 失败: {{ batchProgress.failed }}</p>
        </div>
      </div>

      <div v-if="response" class="respond-card">
        <div class="respond-card-container">
          <div class="header">
            <img class="header-image" :src="banner1" alt="操作结果" />
          </div>
          <div class="body">
            <div class="message-box">
              <p class="message-text">老师！这是您的操作结果：</p>
              <p class="code">{{ response }}</p>
              <p class="message-text">请重启游戏检查是否生效</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>

  <!-- 学生选择器弹窗 -->
  <el-dialog
    v-model="showStudentSelector"
    :title="operationMode === 'batch' ? '批量选择学生' : '选择学生'"
    width="90%"
    :close-on-click-modal="false"
    class="student-selector-dialog"
    :style="{ maxWidth: '700px' }"
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

      <!-- 批量控制按钮 -->
      <div v-if="operationMode === 'batch'" class="batch-controls">
        <el-button size="small" @click="selectAllStudents">全选</el-button>
        <el-button size="small" @click="clearAllStudents">清空</el-button>
        <span class="selected-count">已选择: {{ selectedStudents.length }}</span>
      </div>

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
          :class="{ 'selected': operationMode === 'batch' && isStudentSelected(student.Id) }"
          @click="handleStudentClick(student)"
        >
          <div v-if="operationMode === 'batch'" class="student-checkbox">
            <el-checkbox
              :model-value="isStudentSelected(student.Id)"
              @change="toggleStudentSelection(student)"
            />
          </div>
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
        <el-button
          v-if="operationMode === 'batch'"
          type="primary"
          @click="confirmBatchSelection"
          :disabled="selectedStudents.length === 0"
        >
          确认选择 ({{ selectedStudents.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import axios from 'axios'
import banner1 from '@/assets/images/bg1.ccb168ef.jpg'
import { List, Search, Loading, Avatar } from '@element-plus/icons-vue'

export default {
  name: 'Character',
  components: { List, Search, Loading, Avatar },
  data() {
    return {
      uid: '',
      id: '',
      starGrade: null,
      level: null,
      favorRank: null,
      enableStar: false,
      enableLevel: false,
      enableFavor: false,
      max: 0,
      response: '',
      isSubmitting: false,
      banner1,
      showStudentSelector: false,
      studentSearchQuery: '',
      isLoadingStudents: false,
      studentsData: [],
      operationMode: 'single',
      selectedStudents: [],
      batchProgress: {
        show: false,
        current: 0,
        total: 0,
        percentage: 0,
        status: '',
        currentStudent: '',
        success: 0,
        failed: 0
      },
      cancelBatch: false
    }
  },
  computed: {
    filteredStudents() {
      if (!this.studentsData.length || !this.studentSearchQuery.trim()) {
        return this.studentsData
      }
      const query = this.studentSearchQuery.toLowerCase()
      return this.studentsData.filter(student => {
        const name = (student.Name || student.PersonalName || '').toLowerCase()
        return name.includes(query) || String(student.Id).includes(query)
      })
    },

    displaySelectedStudents() {
      const count = this.selectedStudents.length
      if (count === 0) return ''
      if (count === 1) {
        const student = this.selectedStudents[0]
        return `${student.Name} (ID: ${student.Id})`
      }
      return `已选择 ${count} 个学生`
    },

    canSubmit() {
      return this.uid && (this.operationMode === 'single' ? this.id : this.selectedStudents.length > 0)
    }
  },
  methods: {
    getSubmitButtonText() {
      if (this.isSubmitting) {
        return this.operationMode === 'batch' ? '批量处理中...' : '提交中...'
      }
      return this.operationMode === 'batch'
        ? `批量操作 (${this.selectedStudents.length}个学生)`
        : '提交请求'
    },

    handleSubmit() {
      this.operationMode === 'single' ? this.setCharacter() : this.batchSetCharacter()
    },

    async setCharacter(studentId = null) {
      const baseURL = localStorage.getItem('serverAddress')
      if (!baseURL) {
        const msg = '请先在首页保存服务器地址'
        this.$message.error(msg)
        return { success: false, error: msg }
      }

      const authKey = localStorage.getItem('serverAuthKey')
      const headers = authKey ? { Authorization: authKey } : {}

      try {
        const params = {
          cmd: 'character',
          uid: this.uid,
          characterId: studentId || this.id,
          max: this.max
        }

        if (this.max === 0) {
          if (this.enableStar && this.starGrade !== null) {
            params.starGrade = this.starGrade
          }
          if (this.enableLevel && this.level !== null) {
            params.level = this.level
          }
          if (this.enableFavor && this.favorRank !== null) {
            params.favorRank = this.favorRank
          }
        }

        const config = { params }
        if (authKey) config.headers = { Authorization: authKey }
        
        const res = await axios.get(`${baseURL}/cdq/api`, config)

        const success = res.data.code === 0
        if (!studentId) {
          this.response = success ? JSON.stringify(res.data, null, 2) : res.data.msg
          this.$message[success ? 'success' : 'error'](success ? '操作成功' : '操作失败')
        }

        return { success, data: res.data, error: res.data.msg }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        if (!studentId) {
          this.response = `请求错误：${errorMsg}`
          this.$message.error(this.response)
        }
        return { success: false, error: errorMsg }
      }
    },

    async batchSetCharacter() {
      if (this.selectedStudents.length === 0) {
        this.$message.error('请先选择学生')
        return
      }

      this.isSubmitting = true
      this.cancelBatch = false
      this.batchProgress = {
        show: true,
        current: 0,
        total: this.selectedStudents.length,
        percentage: 0,
        status: '',
        currentStudent: '',
        success: 0,
        failed: 0
      }

      const results = []
      for (let i = 0; i < this.selectedStudents.length; i++) {
        if (this.cancelBatch) {
          this.$message.info('批量操作已取消')
          break
        }

        const student = this.selectedStudents[i]
        this.batchProgress.current = i + 1
        this.batchProgress.percentage = Math.round((i + 1) / this.selectedStudents.length * 100)
        this.batchProgress.currentStudent = `${student.Name} (ID: ${student.Id})`
        this.batchProgress.status = this.batchProgress.percentage === 100 ? 'success' : ''

        const result = await this.setCharacter(student.Id)
        this.batchProgress[result.success ? 'success' : 'failed']++
        results.push({ student, ...result })

        // 批量操作验证
        if (i === 0 && !result.success && result.error) {
          const errorMsg = result.error.toLowerCase()
          if (errorMsg.includes('玩家不在线'))
          {
            this.response = result.error
            this.isSubmitting = false
            this.batchProgress.show = false
            return
          }
        }

        if (i < this.selectedStudents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      const successCount = results.filter(r => r.success).length
      const failedCount = results.length - successCount
      
      if (failedCount === 0) {
        this.response = `批量操作完成！成功处理 ${successCount} 个学生`
        this.$message.success(`批量操作成功！共处理 ${successCount} 个学生`)
      } else {
        this.response = `批量操作完成！成功: ${successCount}, 失败: ${failedCount}`
        this.$message.warning(`批量操作部分成功！成功: ${successCount}, 失败: ${failedCount}`)
      }

      this.isSubmitting = false
      setTimeout(() => this.batchProgress.show = false, 3000)
    },

    async fetchStudents() {
      this.isLoadingStudents = true
      try {
        const studentsData = await import('@/assets/json/id/CharacterExcelTable.json')
        let icons = {}
        try {
          icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
        } catch (error) {
          console.warn('Failed to load icons:', error)
        }

        this.studentsData = studentsData.default.map(student => ({
          ...student,
          Icon: icons[`/src/assets/icon/${student.Id}.png`]?.default || ''
        }))
      } catch (error) {
        this.studentsData = []
        this.$message.error('获取学生列表失败')
        console.error('获取学生数据失败:', error)
      } finally {
        this.isLoadingStudents = false
      }
    },

    handleStudentClick(student) {
      this.operationMode === 'single' ? this.selectStudent(student) : this.toggleStudentSelection(student)
    },

    selectStudent(student) {
      this.id = student.Id
      this.showStudentSelector = false
      this.$message.success(`已选择学生：${student.Name || student.PersonalName || '未知学生'} (ID: ${student.Id})`)
    },

    toggleStudentSelection(student) {
      const index = this.selectedStudents.findIndex(s => s.Id === student.Id)
      index > -1 ? this.selectedStudents.splice(index, 1) : this.selectedStudents.push(student)
    },

    isStudentSelected(studentId) {
      return this.selectedStudents.some(s => s.Id === studentId)
    },

    selectAllStudents() {
      this.selectedStudents = [...this.filteredStudents]
      this.$message.success(`已选择 ${this.selectedStudents.length} 个学生`)
    },

    clearAllStudents() {
      this.selectedStudents = []
      this.$message.info('已清空选择')
    },

    confirmBatchSelection() {
      this.showStudentSelector = false
      this.$message.success(`已选择 ${this.selectedStudents.length} 个学生`)
    },

    handleStudentImageError(event) {
      event.target.style.display = 'none'
      const iconElement = event.target.parentElement.querySelector('.el-icon')
      if (iconElement) iconElement.style.display = 'block'
    }
  },
  watch: {
    showStudentSelector(val) {
      if (val && !this.studentsData.length) this.fetchStudents()
    },
    operationMode(newMode) {
      newMode === 'single' ? (this.selectedStudents = []) : (this.id = '')
    }
  }
}
</script>

<style scoped>
.character-container {
  max-width: 780px;
  margin: 20px auto;
  padding: 0;
}

.character-card {
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12) !important;
  transition: all 0.3s ease;
  overflow: hidden;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.16) !important;
}

:deep(.character-card .el-card__body) { padding: 24px; }

/* 通用按钮样式 */
.student-id-input-group {
  display: flex;
  align-items: center;
  width: 100%;
}

.student-id-input-group .el-input { flex: 1; }

.select-student-btn, .submit-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  border: none !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  color: white !important;
}

.select-student-btn {
  padding: 8px 16px !important;
}

.submit-btn {
  padding: 12px 32px !important;
}

.select-student-btn:hover, .submit-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4) !important;
}

.select-student-btn .el-icon { margin-right: 6px; }

/* 批量操作进度 */
.batch-progress {
  margin: 20px 0;
  padding: 20px;
  background: rgba(79, 172, 254, 0.05);
  border: 1px solid rgba(79, 172, 254, 0.1);
  border-radius: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h3 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.progress-details {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.progress-details p { margin: 4px 0; }

/* 响应卡片 */
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

.body { padding: 30px 20px; }

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

/* 标题样式 */
:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 0 24px;
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

.el-form-item:last-child { margin-top: 24px; }

/* 学生选择器弹窗 */
:deep(.student-selector-dialog) {
  border-radius: 16px;
  overflow: hidden;
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

:deep(.student-selector-dialog .el-dialog__body) {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.student-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

/* 搜索和控制 */
.student-search {
  margin: 20px 24px 16px 24px;
  width: auto;
  max-width: 100%;
  box-sizing: border-box;
}

.batch-controls {
  margin: 0 24px 16px 24px;
  padding: 12px 16px;
  background: rgba(79, 172, 254, 0.05);
  border: 1px solid rgba(79, 172, 254, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  color: #4facfe;
  font-weight: 600;
  font-size: 14px;
  margin-left: auto;
}

:deep(.student-search .el-input__wrapper) {
  border-radius: 8px !important;
  border: 1px solid #e1e5e9 !important;
  transition: all 0.3s ease !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

:deep(.student-search .el-input__wrapper.is-focus) {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
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
  min-height: 200px;
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
  width: 100%;
  box-sizing: border-box;
}

.student-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.student-item.selected {
  background: rgba(79, 172, 254, 0.1);
  border-color: #4facfe;
}

.student-item:last-child { margin-bottom: 0; }
.student-checkbox { margin-right: 12px; }

/* 学生头像和信息 */
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
  flex-shrink: 0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-avatar .el-icon {
  font-size: 24px;
  color: #9ca3af;
}

.student-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
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
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}

.student-id, .student-school {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.student-id {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}

.student-school {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 单选按钮组 */
:deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  border: 1px solid #d1d5db !important;
  background: #f9fafb !important;
  color: #374151 !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  margin-right: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  border-color: #4facfe !important;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
  transform: translateY(-1px) !important;
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

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.student-selector-dialog) { width: 95vw !important; margin: 0 auto !important; }
  .student-search, .batch-controls { margin: 16px 16px 12px 16px; }
  .student-list { padding: 0 16px 16px 16px; max-height: 300px; }
  .student-item { padding: 10px 12px; }
  .student-avatar { width: 40px; height: 40px; margin-right: 12px; }
  .student-name { font-size: 15px; }
  .student-details { gap: 6px; }
  .dialog-footer { padding: 12px 16px; }
}

@media (max-width: 480px) {
  :deep(.student-selector-dialog) { width: 98vw !important; }
  .student-search, .batch-controls { margin: 12px 12px 8px 12px; }
  .student-list { padding: 0 12px 12px 12px; }
  .student-item { padding: 8px 10px; }
  .student-avatar { width: 36px; height: 36px; margin-right: 10px; }
  .student-name { font-size: 14px; }
  .student-details { font-size: 12px; gap: 4px; }
}

/* 滚动条 */
.student-list::-webkit-scrollbar { width: 6px; }
.student-list::-webkit-scrollbar-track { background: rgba(243, 244, 246, 0.8); border-radius: 3px; }
.student-list::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.8); border-radius: 3px; }
.student-list::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>