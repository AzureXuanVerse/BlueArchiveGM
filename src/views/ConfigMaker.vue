<template>
  <div class="config-maker">
    <el-card class="function-card" shadow="hover">
      <div class="header-section">
        <h2>配置生成器</h2>
        <p class="description">创建和编辑游戏配置文件</p>
      </div>

      <!-- 标签页 -->
      <div class="tab-navigation">
        <el-button
          v-for="tab in tabs"
          :key="tab.key"
          :type="activeTab === tab.key ? 'primary' : ''"
          :plain="activeTab !== tab.key"
          @click="switchTab(tab.key)"
          class="tab-button"
        >
          {{ tab.icon }} {{ tab.label }}
        </el-button>
      </div>

      <!-- 主内容 -->
      <div class="main-content">
        <!-- 表单区域 -->
        <div class="form-section">
          <div class="section-header">
            <h3>{{ getCurrentTabLabel() }}</h3>
            <el-button v-if="canAddItems()" type="primary" size="small" @click="addItem">
              <el-icon><Plus /></el-icon> 添加条目
            </el-button>
          </div>

          <div class="form-container">
            <transition name="slide-fade" mode="out-in">
              <div :key="activeTab">
                <!-- ArenaNPC -->
                <template v-if="activeTab === 'ArenaNPC'">
                  <el-empty v-if="!formData?.length" description="暂无数据，点击添加条目开始配置" />
                  <div v-else class="items-list">
                    <div v-for="(item, idx) in formData" :key="item.Index" class="config-item">
                      <div class="item-header">
                        <span class="item-title">条目 {{ idx + 1 }}</span>
                        <el-button type="danger" size="small" plain @click="removeArenaItem(idx)">
                          <el-icon><Delete /></el-icon> 删除
                        </el-button>
                      </div>
                      
                      <el-form :model="item" label-width="120px" class="item-form">
                        <div class="form-row">
                          <el-form-item label="Index">
                            <el-input-number v-model="item.Index" :min="1" size="small" />
                          </el-form-item>
                          <el-form-item label="NPC账户等级">
                            <el-input-number v-model="item.NpcaccountLevel" :min="0" size="small" />
                          </el-form-item>
                        </div>
                        <div class="form-row">
                          <el-form-item label="NPC等级">
                            <el-input-number v-model="item.Npclevel" :min="0" size="small" />
                          </el-form-item>
                          <el-form-item label="NPC等级偏差">
                            <el-input-number v-model="item.NpclevelDeviation" :min="0" size="small" />
                          </el-form-item>
                        </div>
                        <el-form-item label="NPC星级">
                          <el-input-number v-model="item.NpcstarGrade" :min="0" size="small" />
                        </el-form-item>
                        
                        <div class="array-fields">
                          <el-form-item label="队伍主学生ID">
                            <div class="array-container">
                              <div v-for="(id, i) in item.ExceptionMainCharacterIds" :key="i" class="array-item">
                                <el-input-number v-model="item.ExceptionMainCharacterIds[i]" :min="0" size="small" />
                                <el-button type="danger" size="small" plain @click="removeArray(item.ExceptionMainCharacterIds, i)">
                                  <el-icon><Close /></el-icon>
                                </el-button>
                              </div>
                              <el-button type="primary" size="small" plain @click="addArray(item.ExceptionMainCharacterIds)">
                                <el-icon><Plus /></el-icon> 添加ID
                              </el-button>
                            </div>
                          </el-form-item>
                          
                          <el-form-item label="副学生ID">
                            <div class="array-container">
                              <div v-for="(id, i) in item.ExceptionSupportCharacterIds" :key="i" class="array-item">
                                <el-input-number v-model="item.ExceptionSupportCharacterIds[i]" :min="0" size="small" />
                                <el-button type="danger" size="small" plain @click="removeArray(item.ExceptionSupportCharacterIds, i)">
                                  <el-icon><Close /></el-icon>
                                </el-button>
                              </div>
                              <el-button type="primary" size="small" plain @click="addArray(item.ExceptionSupportCharacterIds)">
                                <el-icon><Plus /></el-icon> 添加ID
                              </el-button>
                            </div>
                          </el-form-item>
                        </div>
                      </el-form>
                    </div>
                  </div>
                </template>

                <!-- Attendance -->
                <template v-else-if="activeTab === 'Attendance'">
                  <div class="config-item">
                    <div class="item-header">
                      <span class="item-title">签到配置</span>
                    </div>
                    
                    <el-form :model="formData" label-width="120px" class="item-form">
                      <div class="form-group">
                        <h4>基础设置</h4>
                        <div class="form-row">
                          <el-form-item label="ID">
                            <el-input-number v-model="formData.Id" size="small" />
                          </el-form-item>
                          <el-form-item label="类型">
                            <el-input v-model="formData.Type" size="small" />
                          </el-form-item>
                        </div>
                        <div class="form-row">
                          <el-form-item label="账号类型">
                            <el-input v-model="formData.AccountType" size="small" />
                          </el-form-item>
                          <el-form-item label="账户等级限制">
                            <el-input-number v-model="formData.AccountLevelLimit" size="small" />
                          </el-form-item>
                        </div>
                      </div>

                      <div class="form-group">
                        <h4>显示设置</h4>
                        <el-form-item label="标题（勿动）">
                          <el-input v-model="formData.Title" size="small" />
                        </el-form-item>
                        <el-form-item label="标题图片路径（勿动）">
                          <el-input v-model="formData.TitleImagePath" size="small" />
                        </el-form-item>
                      </div>

                      <div class="form-group">
                        <h4>规则设置</h4>
                        <div class="form-row">
                          <el-form-item label="计数规则">
                            <el-input v-model="formData.CountRule" size="small" />
                          </el-form-item>
                          <el-form-item label="重置规则">
                            <el-input v-model="formData.CountReset" size="small" />
                          </el-form-item>
                        </div>
                        <el-form-item label="书本大小">
                          <el-input-number v-model="formData.BookSize" size="small" />
                        </el-form-item>
                      </div>

                      <div class="form-group">
                        <h4>时间设置</h4>
                        <div class="form-row">
                          <el-form-item label="开始时间">
                            <el-date-picker v-model="formData.StartDate" type="datetime" size="small" />
                          </el-form-item>
                          <el-form-item label="结束时间">
                            <el-date-picker v-model="formData.EndDate" type="datetime" size="small" />
                          </el-form-item>
                        </div>
                        <el-form-item label="邮件类型">
                          <el-input v-model="formData.MailType" size="small" />
                        </el-form-item>
                      </div>
                    </el-form>

                    <!-- 奖励列表 -->
                    <div class="rewards-section">
                      <div class="section-header">
                        <h4>奖励配置</h4>
                        <el-button type="primary" size="small" @click="addAttendanceReward">
                          <el-icon><Plus /></el-icon> 添加奖励
                        </el-button>
                      </div>
                      
                      <div v-if="!formData.AttendanceRewardArray?.length" class="empty-rewards">
                        <el-empty description="暂无奖励，点击添加奖励" :image-size="60" />
                      </div>
                      <div v-else class="rewards-list">
                        <div v-for="(reward, i) in formData.AttendanceRewardArray" :key="i" class="reward-item">
                          <div class="reward-header">
                            <span>奖励 {{ i + 1 }}</span>
                            <el-button type="danger" size="small" plain @click="removeAttendanceReward(i)">
                              <el-icon><Delete /></el-icon> 删除
                            </el-button>
                          </div>
                          <div class="form-row">
                            <el-form-item label="奖励类型">
                              <el-input-number v-model="reward.RewardParcelType" :min="0" size="small" />
                            </el-form-item>
                            <el-form-item label="奖励ID">
                              <el-input-number v-model="reward.RewardId" :min="0" size="small" />
                            </el-form-item>
                            <el-form-item label="奖励数量">
                              <el-input-number v-model="reward.RewardAmoun" :min="0" size="small" />
                            </el-form-item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- RaidSchedule / RaidEliminateSchedule -->
                <template v-else>
                  <div class="config-item">
                    <div class="item-header">
                      <span class="item-title">{{ getCurrentTabLabel() }}配置</span>
                    </div>
                    
                    <div v-for="(item, key, idx) in formData" :key="key" class="schedule-item">
                      <h4>赛季 {{ idx + 1 }}</h4>
                      <el-form :model="item" label-width="120px" class="item-form">
                        <div class="form-row">
                          <el-form-item label="赛季ID">
                            <el-input-number v-model="item.SeasonId" size="small" />
                          </el-form-item>
                          <el-form-item label="下一赛季ID">
                            <el-input-number v-model="item.NextSeasonId" size="small" />
                          </el-form-item>
                        </div>
                        <div class="form-row">
                          <el-form-item label="开始时间">
                            <el-date-picker v-model="item.SeasonStartData" type="datetime" size="small" />
                          </el-form-item>
                          <el-form-item label="结束时间">
                            <el-date-picker v-model="item.SeasonEndData" type="datetime" size="small" />
                          </el-form-item>
                        </div>
                      </el-form>
                    </div>
                  </div>
                </template>
              </div>
            </transition>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-section">
          <div class="section-header">
            <h3>JSON 预览</h3>
            <el-button type="success" @click="exportJson">
              <el-icon><Download /></el-icon> 导出文件
            </el-button>
          </div>
          
          <div class="preview-container">
            <el-input
              type="textarea"
              v-model="jsonText"
              readonly
              placeholder="JSON 配置将在这里显示"
              class="json-preview"
              :autosize="{ minRows: 25, maxRows: 35 }"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Plus, Delete, Close, Download } from '@element-plus/icons-vue'
import ArenaNPC from '@/assets/json/configmaker/ArenaNPC.json'
import Attendance from '@/assets/json/configmaker/Attendance.json'
import RaidSchedule from '@/assets/json/configmaker/RaidSchedule.json'
import RaidEliminateSchedule from '@/assets/json/configmaker/RaidEliminateSchedule.json'

export default {
  name: 'ConfigMaker',
  components: { Plus, Delete, Close, Download },
  data() {
    return {
      tabs: [
        { key: 'ArenaNPC', label: '战术对抗赛', icon: '⚔️' },
        { key: 'Attendance', label: '签到', icon: '📅' },
        { key: 'RaidSchedule', label: '总力战', icon: '🏆' },
        { key: 'RaidEliminateSchedule', label: '大决战', icon: '💥' },
      ],
      activeTab: 'ArenaNPC',
      formData: null,
      jsonText: '',
    }
  },
  watch: {
    formData: {
      deep: true,
      handler() {
        this.updateJsonText()
      },
    },
  },
  created() {
    this.loadJson()
  },
  mounted() {
    this.$nextTick(() => {
      this.updateJsonText()
    })
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.loadJson()
    },
    getCurrentTabLabel() {
      return this.tabs.find(tab => tab.key === this.activeTab)?.label || ''
    },
    canAddItems() {
      return this.activeTab === 'ArenaNPC'
    },
    addItem() {
      if (this.activeTab === 'ArenaNPC') {
        this.addArenaItem()
      }
    },
    loadJson() {
      let data
      switch (this.activeTab) {
        case 'ArenaNPC':
          data = JSON.parse(JSON.stringify(ArenaNPC))
          break
        case 'Attendance':
          const att = JSON.parse(JSON.stringify(Attendance['1']))
          att.AttendanceRewardArray = Object.values(att.AttendanceReward || {})
          data = att
          break
        case 'RaidSchedule':
          data = JSON.parse(JSON.stringify(RaidSchedule))
          break
        case 'RaidEliminateSchedule':
          data = JSON.parse(JSON.stringify(RaidEliminateSchedule))
          break
      }
      this.formData = data
      this.updateJsonText()
    },
    addArenaItem() {
      const nextIndex = this.formData.reduce((m, i) => Math.max(m, i.Index), 0) + 1
      this.formData.push({
        Index: nextIndex,
        NpcaccountLevel: 0,
        Npclevel: 0,
        NpclevelDeviation: 0,
        NpcstarGrade: 0,
        ExceptionMainCharacterIds: [],
        ExceptionSupportCharacterIds: [],
      })
    },
    removeArenaItem(i) {
      this.formData.splice(i, 1)
    },
    addArray(arr) {
      arr.push(0)
    },
    removeArray(arr, i) {
      arr.splice(i, 1)
    },
    addAttendanceReward() {
      if (!this.formData.AttendanceRewardArray) {
        this.formData.AttendanceRewardArray = []
      }
      this.formData.AttendanceRewardArray.push({ 
        RewardParcelType: 0, 
        RewardId: 0, 
        RewardAmoun: 0 
      })
    },
    removeAttendanceReward(i) {
      this.formData.AttendanceRewardArray.splice(i, 1)
    },
    updateJsonText() {
      if (!this.formData) return
      
      if (this.activeTab === 'ArenaNPC') {
        this.jsonText = JSON.stringify(this.formData, null, 2)
      } else if (this.activeTab === 'Attendance') {
        const rewardObj = {}
        if (this.formData.AttendanceRewardArray) {
          this.formData.AttendanceRewardArray.forEach((r, idx) => {
            rewardObj[idx + 1] = r
          })
        }
        const { AttendanceRewardArray, ...rest } = this.formData
        rest.AttendanceReward = rewardObj
        this.jsonText = JSON.stringify({ 1: rest }, null, 2)
      } else {
        this.jsonText = JSON.stringify(this.formData, null, 2)
      }
    },
    exportJson() {
      const blob = new Blob([this.jsonText], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${this.activeTab}.json`
      link.click()
      URL.revokeObjectURL(link.href)
      this.$message.success(`${this.activeTab}.json 导出成功`)
    },
  },
}
</script>

<style scoped>
.config-maker { padding: 20px; }

.function-card {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.header-section {
  text-align: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

h2 {
  color: #1f2937;
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.description {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.tab-navigation {
  display: flex;
  gap: 12px;
  padding: 0 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 0 24px 24px;
  min-height: 600px;
}

.form-section, .preview-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3, .section-header h4 {
  color: #374151;
  font-weight: 600;
  margin: 0;
}

.form-container {
  flex: 1;
  overflow-y: auto;
  max-height: 800px;
  padding-right: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-item, .schedule-item, .reward-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.item-header, .reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-title {
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}

.item-form {
  margin-top: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 8px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.form-group h4 {
  color: #374151;
  font-weight: 600;
  margin: 0 0 16px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.array-fields {
  margin-top: 16px;
}

.array-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.array-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rewards-section {
  margin-top: 24px;
}

.empty-rewards {
  text-align: center;
  padding: 40px 20px;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.json-preview {
  flex: 1;
  height: 100%;
}

:deep(.json-preview .el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  resize: none;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  min-height: 500px !important;
  height: auto !important;
}

:deep(.json-preview .el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-input-number) {
  width: 100%;
}

.form-container::-webkit-scrollbar { width: 6px; }
.form-container::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 3px; }
.form-container::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }

@media (max-width: 1200px) {
  .main-content { grid-template-columns: 1fr; gap: 24px; }
  .preview-section { order: -1; min-height: 400px; }
  .json-preview :deep(.el-textarea__inner) { min-height: 300px !important; }
}

@media (max-width: 768px) {
  .config-maker { padding: 16px; }
  .tab-navigation { padding: 0 16px; }
  .main-content { padding: 0 16px 16px; }
  .form-row { grid-template-columns: 1fr; gap: 8px; }
  .preview-section { min-height: 300px; padding: 16px; }
  :deep(.json-preview .el-textarea__inner) { min-height: 250px !important; font-size: 11px; }
}

.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(20px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-20px); }
</style>