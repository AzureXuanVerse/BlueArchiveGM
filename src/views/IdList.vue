<template>
  <el-card class="function-card" shadow="hover">
    <div class="card-header">
      <h2>物品列表</h2>
      <p class="description">查看和搜索游戏中的各种物品、学生、装备等，点击卡片可复制ID</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>正在加载数据...</p>
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-if="errorMessage"
      title="数据加载失败"
      type="error"
      :description="errorMessage"
      show-icon
      class="error-alert"
    />

    <!-- 主内容 -->
    <div v-if="!isLoading && !errorMessage" class="idlist-container">
      <!-- 侧边栏 -->
      <div class="idlist-sidebar">
        <div class="sidebar-header">
          <h3>分类筛选</h3>
        </div>
        <el-menu class="idlist-menu" :default-active="selectedSource" @select="handleSourceSelect">
          <el-menu-item v-for="option in sourceOptions" :key="option.value" :index="option.value">
            <el-icon><component :is="option.icon" /></el-icon>
            <span>{{ option.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区 -->
      <div class="idlist-main">
        <!-- 搜索和筛选区域 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索物品（名称、描述或ID）"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <div class="filter-info">
            <span>当前分类：{{ getCurrentCategoryLabel() }}</span>
            <span>共 {{ filteredItems.length }} 个项目</span>
          </div>
        </div>

        <!-- 数据列表 -->
        <div v-if="filteredItems.length > 0" class="idlist-list">
          <div
            v-for="(item, index) in paginatedItems"
            :key="`${item.source}-${item.Id}`"
            class="idlist-item"
            @click="copyToClipboard(item.Id)"
          >
            <div class="item-icon-container">
              <img 
                v-if="item.Icon" 
                :src="item.Icon" 
                :alt="item.Name" 
                class="idlist-item-icon"
                @error="handleImageError"
              />
              <div v-else class="idlist-item-icon-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
            
            <div class="idlist-item-info">
              <div class="idlist-item-name">{{ item.Name || '未知物品' }}</div>
              <div class="idlist-item-desc">{{ item.Desc || '暂无描述' }}</div>
              <div class="idlist-item-id">ID: {{ item.Id }}</div>
              <div class="idlist-item-source">
                <el-tag size="small" :type="getTagType(item.Category)">
                  {{ item.Category }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 空数据提示 -->
        <el-empty 
          v-else 
          description="暂无数据"
          class="empty-state"
        >
          <template #image>
            <el-icon size="64"><Box /></el-icon>
          </template>
          <template #description>
            <p>{{ searchQuery ? '没有找到匹配的物品' : '该分类暂无数据' }}</p>
          </template>
        </el-empty>

        <!-- 分页控件 -->
        <el-pagination
          v-if="filteredItems.length > pageSize"
          background
          layout="total, prev, pager, next, jumper"
          :total="filteredItems.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          class="pagination"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
import { Loading, Search, Picture, Box } from '@element-plus/icons-vue'

// 使用同步导入数据文件
import itemsData from '@/assets/items.json'
import studentsData from '@/assets/students.json'
import furnitureData from '@/assets/furniture.json'
import equipmentData from '@/assets/equipment.json'
import currencyData from '@/assets/currency.json'
import stickersData from '@/assets/stickers.json'
import memoryLobbyData from '@/assets/memorylobby.json'

export default {
  name: 'IdList',
  components: {
    Loading,
    Search,
    Picture,
    Box
  },
  data() {
    return {
      searchQuery: '',
      selectedSource: 'combined',
      pageSize: 12,
      currentPage: 1,
      isLoading: true,
      errorMessage: '',
      sourceOptions: [
        { value: 'combined', label: '综合', icon: 'Collection' },
        { value: 'Material', label: '材料', icon: 'Orange' },
        { value: 'Character', label: '学生', icon: 'Avatar' },
        { value: 'Equipment', label: '装备', icon: 'Sword' },
        { value: 'Furniture', label: '家具', icon: 'House' },
        { value: 'Favor', label: '礼物', icon: 'Gift' },
        { value: 'Emblem', label: '称号', icon: 'Medal' },
        { value: 'Sticker', label: '贴纸', icon: 'Picture' },
        { value: 'MemoryLobby', label: '记忆大厅', icon: 'Monitor' },
        { value: 'Other', label: '其他', icon: 'More' },
      ],
      itemsList: [],
      studentsList: [],
      furnitureList: [],
      equipmentList: [],
      currencyList: [],
      stickerList: [],
      memoryLobbyList: [],
    }
  },
  computed: {
    combinedItems() {
      return [
        ...this.itemsList,
        ...this.studentsList,
        ...this.furnitureList,
        ...this.equipmentList,
        ...this.currencyList,
        ...this.stickerList,
        ...this.memoryLobbyList,
      ]
    },
    
    currentSourceItems() {
      if (this.selectedSource === 'combined') {
        return this.combinedItems.slice().sort((a, b) => a.Id - b.Id)
      } else if (this.selectedSource === 'Furniture') {
        return this.combinedItems.filter((item) => item.Category === 'Furnitures')
      } else {
        return this.combinedItems.filter((item) => item.Category === this.selectedSource)
      }
    },
    
    filteredItems() {
      const query = this.searchQuery.toLowerCase()
      if (!query) return this.currentSourceItems
      
      return this.currentSourceItems.filter((item) => {
        return (
          (item.Name && item.Name.toLowerCase().includes(query)) ||
          (item.Desc && item.Desc.toLowerCase().includes(query)) ||
          (item.Id && item.Id.toString().includes(query))
        )
      })
    },
    
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredItems.slice(start, start + this.pageSize)
    },
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page
      this.scrollToTop()
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },

    copyToClipboard(id) {
      navigator.clipboard
        .writeText(id.toString())
        .then(() => {
          this.$message.success(`ID ${id} 已复制到剪贴板！`)
        })
        .catch((err) => {
          // 降级处理
          const textArea = document.createElement('textarea')
          textArea.value = id.toString()
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.$message.success(`ID ${id} 已复制到剪贴板！`)
        })
    },

    handleSourceSelect(key) {
      this.selectedSource = key
      this.currentPage = 1
    },

    handleImageError(event) {
      event.target.style.display = 'none'
      if (event.target.nextElementSibling) {
        event.target.nextElementSibling.style.display = 'flex'
      }
    },

    getCurrentCategoryLabel() {
      const option = this.sourceOptions.find(opt => opt.value === this.selectedSource)
      return option ? option.label : '未知'
    },

    getCategoryCount(category) {
      if (category === 'combined') {
        return this.combinedItems.length
      } else if (category === 'Furniture') {
        return this.combinedItems.filter(item => item.Category === 'Furnitures').length
      } else {
        return this.combinedItems.filter(item => item.Category === category).length
      }
    },

    getTagType(category) {
      const typeMap = {
        'Material': '',
        'Character': 'success',
        'Equipment': 'warning',
        'Furnitures': 'info',
        'Favor': 'danger',
        'Emblem': 'success',
        'Sticker': 'warning',
        'MemoryLobby': 'info',
        'Other': 'info'
      }
      return typeMap[category] || ''
    },

    scrollToTop() {
      this.$nextTick(() => {
        const container = document.querySelector('.idlist-list')
        if (container) {
          container.scrollIntoView({ behavior: 'smooth' })
        }
      })
    },

    async loadData() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        // 动态加载图标
        let icons = {}
        try {
          icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
        } catch (error) {
          console.warn('Failed to load icons:', error)
        }

        const keys = [
          'Id', 'Rarity', 'Icon', 'Name', 'Desc', 'Category', 'SubCategory',
          'DevName', 'School', 'Club', 'FamilyName', 'PersonalName', 'SchoolYear',
          'CharacterAge', 'Birthday', 'CharacterSSRNew', 'ProfileIntroduction',
          'Hobby', 'CharacterVoice', 'Illustrator', 'Designer', 'CharHeightMetric',
          'CharHeightImperial'
        ]

        const allowedCategories = [
          'Material', 'Character', 'Equipment', 'Furnitures', 'Favor', 'Emblem', 'Sticker', 'MemoryLobby'
        ]

        const processData = (data, defaultCategory = null, sourceKey) => {
          if (!Array.isArray(data)) return []
          
          return data.map((item) => {
            const newItem = {}
            keys.forEach((key) => {
              if (item[key] !== undefined) {
                newItem[key] = item[key]
              }
            })

            let cat = newItem.Category || newItem.SubCategory || defaultCategory
            newItem.Category = allowedCategories.includes(cat) ? cat : 'Other'
            newItem.source = sourceKey

            // 处理图标
            if (sourceKey === 'students') {
              const iconPath = `/src/assets/icon/${newItem.Id}.png`
              newItem.Icon = icons[iconPath]?.default || ''
            } else {
              if (newItem.Icon) {
                newItem.Icon = icons[`/src/assets/icon/${newItem.Icon}.png`]?.default || ''
              }
            }

            return newItem
          })
        }

        // 处理各类数据
        this.itemsList = processData(itemsData, null, 'items')
        this.studentsList = processData(studentsData, 'Character', 'students')
        this.furnitureList = processData(furnitureData, 'Furnitures', 'furniture')
        this.equipmentList = processData(equipmentData, 'Equipment', 'equipment')
        this.currencyList = processData(currencyData, 'Other', 'currency')
        
        // 使用专门的JSON文件数据
        this.stickerList = processData(stickersData, 'Sticker', 'stickers')
        this.memoryLobbyList = processData(memoryLobbyData, 'MemoryLobby', 'memorylobby')

        console.log('Data loaded successfully:', {
          items: this.itemsList.length,
          students: this.studentsList.length,
          furniture: this.furnitureList.length,
          equipment: this.equipmentList.length,
          currency: this.currencyList.length,
          stickers: this.stickerList.length,
          memoryLobby: this.memoryLobbyList.length,
          total: this.combinedItems.length
        })

      } catch (error) {
        console.error('Failed to load data:', error)
        this.errorMessage = '数据加载失败，请刷新页面重试'
      } finally {
        this.isLoading = false
      }
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1
    },
  },

  async mounted() {
    await this.loadData()
  },
}
</script>

<style scoped>
/* 主卡片样式 */
.function-card {
  max-width: 1250px;
  margin: 2rem auto;
  padding: 24px;
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

/* 加载和错误状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-container .el-icon {
  font-size: 32px;
  margin-bottom: 16px;
  color: #3b82f6;
}

.error-alert {
  margin-bottom: 24px;
  border-radius: 8px;
}

/* 主容器 */
.idlist-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 侧边栏样式 */
.idlist-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px 20px;
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.idlist-menu {
  border: none;
  background: transparent;
  padding: 12px;
}

:deep(.idlist-menu .el-menu-item) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

:deep(.idlist-menu .el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

:deep(.idlist-menu .el-menu-item:hover) {
  background-color: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
}

:deep(.idlist-menu .el-menu-item.is-active) {
  background-color: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  font-weight: 500;
}

/* 主内容区 */
.idlist-main {
  flex: 1;
  min-width: 0;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 24px;
}

.search-input {
  margin-bottom: 12px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

:deep(.search-input .el-input__wrapper:focus-within) {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.filter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
}

/* 数据列表 */
.idlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  animation: fadeInItems 0.6s ease-out;
}

.idlist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(229, 231, 235, 0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.idlist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(255, 255, 255, 0.95);
}

.item-icon-container {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249, 250, 251, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.idlist-item-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 4px;
}

.idlist-item-icon-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #9ca3af;
  font-size: 24px;
}

.idlist-item-info {
  text-align: center;
  width: 100%;
}

.idlist-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.idlist-item-desc {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
  line-height: 1.3;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.idlist-item-id {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 8px;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.idlist-item-source {
  display: flex;
  justify-content: center;
}

/* 空状态 */
.empty-state {
  padding: 60px 20px;
}

:deep(.empty-state .el-empty__image) {
  margin-bottom: 16px;
}

:deep(.empty-state .el-empty__description) {
  color: #6b7280;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  animation: fadeIn 0.6s ease;
}

/* 动画 */
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

@keyframes fadeInItems {
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
@media (max-width: 1024px) {
  .idlist-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .idlist-sidebar {
    width: 100%;
  }
  
  :deep(.idlist-menu) {
    display: flex;
    overflow-x: auto;
    padding: 8px 12px;
  }
  
  :deep(.idlist-menu .el-menu-item) {
    flex-shrink: 0;
    margin: 0 4px;
    white-space: nowrap;
  }
  
  .idlist-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .function-card {
    margin: 20px;
    padding: 16px;
  }
  
  .filter-info {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
  
  .idlist-list {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .idlist-item {
    padding: 12px;
  }
  
  .item-icon-container {
    width: 48px;
    height: 48px;
  }
  
  .idlist-item-icon {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .function-card {
    margin: 16px;
  }
  
  .idlist-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .idlist-item-name {
    font-size: 13px;
  }
  
  .idlist-item-desc {
    font-size: 11px;
  }
}
</style>
