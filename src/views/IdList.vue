<template>
  <el-card class="function-card" shadow="hover">
    <div class="header-section">
      <h2>物品列表</h2>
      <p class="tips">点击卡片可以复制ID ~</p>
    </div>

    <div class="idlist-container">
      <!-- 侧边栏 -->
      <div class="idlist-sidebar">
        <div class="sidebar-title">分类筛选</div>
        <el-menu class="idlist-menu" :default-active="selectedSource" @select="handleSourceSelect">
          <el-menu-item v-for="option in sourceOptions" :key="option.value" :index="option.value">
            <span class="menu-icon">{{ getMenuIcon(option.value) }}</span>
            <span class="menu-text">{{ option.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区 -->
      <div class="idlist-main">
        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索物品（名称、描述或ID）"
            class="search-input"
            size="large"
            clearable
          >
            <template #prefix>
              <i class="bi bi-search"></i>
            </template>
          </el-input>

          <!-- 筛选面板 -->
          <div class="filter-section">
            <div class="filter-group">
              <!-- 稀有度筛选 -->
              <div class="filter-row">
                <span class="filter-label">稀有度:</span>
                <el-checkbox-group v-model="selectedRarities">
                  <el-checkbox
                    v-for="rarity in rarityOptions"
                    :key="rarity.value"
                    :label="rarity.value"
                    :class="['rarity-checkbox', rarity.class]"
                  >
                    <span class="rarity-badge-small" :class="rarity.class">{{ rarity.label }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <!-- 子分类筛选 -->
              <div v-if="subCategoryOptions.length > 0" class="filter-row">
                <span class="filter-label">子分类:</span>
                <el-checkbox-group v-model="selectedSubCategories">
                  <el-checkbox
                    v-for="subCat in subCategoryOptions"
                    :key="subCat.value"
                    :label="subCat.value"
                    class="sub-category-checkbox"
                  >
                    {{ subCat.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <el-button
                size="small"
                type="info"
                plain
                @click="clearAllFilters"
                class="clear-filter-btn"
              >
                清除全部筛选
              </el-button>
            </div>
          </div>

          <div class="search-stats">
            找到 <span class="count">{{ filteredItems.length }}</span> 个物品
            <span v-if="hasActiveFilters" class="filter-info">
              (筛选条件: {{ getActiveFiltersText() }})
            </span>
          </div>
        </div>

        <!-- 数据列表 -->
        <div
          class="idlist-list"
          :class="{ 'emblem-layout': selectedSource === 'emblem' }"
          v-if="paginatedItems.length > 0"
        >
          <div
            v-for="(item, index) in paginatedItems"
            :key="index"
            class="idlist-item"
            :class="{ 'emblem-item': selectedSource === 'emblem' }"
            @click="copyToClipboard(item.Id)"
          >
            <div class="item-icon-wrapper">
              <img :src="item.Icon" :alt="item.Name" class="idlist-item-icon" />
              <div class="rarity-badge" :class="getRarityClass(item.Rarity)">
                {{ getRarityText(item.Rarity) }}
              </div>
            </div>
            <div class="idlist-item-info">
              <div class="idlist-item-name">{{ item.Name }}</div>
              <div class="idlist-item-desc">{{ item.Desc }}</div>
              <div class="idlist-item-meta">
                <span class="idlist-item-id">ID: {{ item.Id }}</span>
                <span class="idlist-item-category">{{ getCategoryText(item.Category) }}</span>
              </div>
            </div>
            <div class="copy-hint">点击复制</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i class="bi bi-search"></i>
          <p>没有找到匹配的物品</p>
          <span>试试其他关键词吧</span>
        </div>

        <!-- 分页控件 -->
        <el-pagination
          v-if="filteredItems.length > pageSize"
          background
          layout="prev, pager, next, jumper"
          :total="filteredItems.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
          class="pagination"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
import itemsData from '@/assets/json/id/ItemExcelTable.json'
import studentsData from '@/assets/json/id/CharacterExcelTable.json'
import furnitureData from '@/assets/json/id/FurnitureExcelTable.json'
import equipmentData from '@/assets/json/id/EquipmentExcelTable.json'
import currencyData from '@/assets/json/id/CurrencyExcel.json'
import emblemData from '@/assets/json/id/EmblemExcel.json'
import memoryLobbyData from '@/assets/json/id/MemoryLobbyExcel.json'
import stickerData from '@/assets/json/id/StickerPageContentExcel.json'
import idCardBackgroundData from '@/assets/json/id/IdCardBackgroundExcel.json'

// 导入常量定义
import constants from '@/assets/json/constants/idlist_constants.json'

// 使用导入的常量
const RARITY_OPTIONS = constants.RARITY_OPTIONS
const SOURCE_OPTIONS = constants.SOURCE_OPTIONS
const MENU_ICONS = constants.MENU_ICONS
const RARITY_MAP = constants.RARITY_MAP
const RARITY_TEXT_MAP = constants.RARITY_TEXT_MAP
const CATEGORY_TEXTS = constants.CATEGORY_TEXTS
const SUB_CATEGORY_OPTIONS = constants.SUB_CATEGORY_OPTIONS

export default {
  name: 'IdList',
  data() {
    return {
      searchQuery: '',
      selectedSource: 'combined',
      selectedRarities: [],
      selectedSubCategories: [],
      pageSize: 9,
      currentPage: 1,
      sourceOptions: SOURCE_OPTIONS,
      rarityOptions: RARITY_OPTIONS,
      // 数据存储
      dataLists: {}
    }
  },
  computed: {
    combinedItems() {
      return Object.values(this.dataLists).flat()
    },
    subCategoryOptions() {
      return SUB_CATEGORY_OPTIONS[this.selectedSource] || []
    },
    hasActiveFilters() {
      return this.selectedRarities.length > 0 || this.selectedSubCategories.length > 0
    },
    currentSourceItems() {
      const sourceMap = {
        combined: () => this.combinedItems,
        items: () => this.dataLists.items || [],
        Character: () => this.dataLists.students || [],
        equipment: () => this.dataLists.equipment || [],
        furniture: () => this.dataLists.furniture || [],
        emblem: () => this.dataLists.emblem || [],
        MemoryLobby: () => this.dataLists.memoryLobby || [],
        Sticker: () => this.dataLists.sticker || [],
        IdCardBackground: () => this.dataLists.idCardBackground || []
      }

      const getItems = sourceMap[this.selectedSource] || (() => this.combinedItems.filter(item => item.Category === this.selectedSource))
      return getItems().slice().sort((a, b) => a.Id - b.Id)
    },
    filteredItems() {
      const query = this.searchQuery.toLowerCase()
      let items = this.currentSourceItems.filter(item =>
        (item.Name && item.Name.toLowerCase().includes(query)) ||
        (item.Desc && item.Desc.toLowerCase().includes(query)) ||
        (item.Id && item.Id.toString().includes(query))
      )

      // 稀有度筛选
      if (this.selectedRarities.length > 0) {
        items = items.filter(item => {
          const itemRarity = typeof item.Rarity === 'string' ? item.Rarity : 'N'
          return this.selectedRarities.includes(itemRarity)
        })
      }

      // 子分类筛选
      if (this.selectedSubCategories.length > 0) {
        items = items.filter(item => {
          const categoryToCheck = this.selectedSource === 'furniture' ? item.SubCategory : item.Category
          return this.selectedSubCategories.includes(categoryToCheck)
        })
      }

      return items
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredItems.slice(start, start + this.pageSize)
    },
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page
    },
    copyToClipboard(id) {
      navigator.clipboard.writeText(id.toString())
        .then(() => this.$message.success(`ID ${id} 已复制到剪贴板！`))
        .catch(() => this.$message.error('复制失败'))
    },
    handleSourceSelect(key) {
      this.selectedSource = key
      this.currentPage = 1
    },
    clearAllFilters() {
      this.selectedRarities = []
      this.selectedSubCategories = []
      this.currentPage = 1
    },
    getActiveFiltersText() {
      const filters = []
      if (this.selectedRarities.length > 0) {
        filters.push(`稀有度: ${this.selectedRarities.join(', ')}`)
      }
      if (this.selectedSubCategories.length > 0) {
        const labels = this.selectedSubCategories.map(cat => {
          const option = this.subCategoryOptions.find(opt => opt.value === cat)
          return option ? option.label : cat
        })
        filters.push(`子分类: ${labels.join(', ')}`)
      }
      return filters.join('; ')
    },
    getMenuIcon(value) {
      return MENU_ICONS[value] || '📁'
    },
    getRarityClass(rarity) {
      if (typeof rarity === 'string') {
        return RARITY_MAP[rarity] || 'rarity-1'
      }
      return `rarity-${rarity || 1}`
    },
    getRarityText(rarity) {
      return typeof rarity === 'string' ? rarity : (RARITY_TEXT_MAP[rarity] || 'N')
    },
    getCategoryText(category) {
      return CATEGORY_TEXTS[category] || category
    },
    resetPage() {
      this.currentPage = 1
    }
  },
  watch: {
    searchQuery: 'resetPage',
    selectedRarities: 'resetPage',
    selectedSubCategories: 'resetPage',
    selectedSource() {
      this.selectedSubCategories = []
      this.currentPage = 1
    }
  },
  async created() {
    const icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
    const keys = ['Id', 'Rarity', 'Icon', 'Name', 'Desc', 'Category', 'SubCategory', 'DevName', 'School', 'Club', 'FamilyName', 'PersonalName', 'SchoolYear', 'CharacterAge', 'Birthday', 'CharacterSSRNew', 'ProfileIntroduction', 'Hobby', 'CharacterVoice', 'Illustrator', 'Designer', 'CharHeightMetric', 'CharHeightImperial']
    const allowedCategories = [
      'Material', 'Coin', 'CharacterExpGrowth', 'Favor', 'Consumable', 'Collectible', 'InvisibleToken', 'RecruitCoin', 'SecretStone',
      'Character', 'Exp', 'Hat', 'Gloves', 'Shoes', 'Bag', 'Badge', 'Hairpin', 'Charm', 'Necklace', 'Watch',
      'WeaponExpGrowthA', 'WeaponExpGrowthB', 'WeaponExpGrowthC', 'WeaponExpGrowthZ',
      'Interiors', 'Decorations', 'Furnitures', 'Default', 'Mission', 'MainStory', 'Boss', 'Etc_Anniversary', 'MultiFloorRaid', 'Potential',
      'MemoryLobby', 'Sticker', 'IdCardBackground'
    ]

    const processData = (data, defaultCategory, sourceKey) => {
      return data.map(item => {
        const newItem = {}
        keys.forEach(key => {
          if (item[key] !== undefined) newItem[key] = item[key]
        })

        // 处理ID字段差异
        if (item.ID !== undefined && !newItem.Id) {
          newItem.Id = item.ID
        }

        // 设置分类
        if (sourceKey === 'memoryLobby') {
          newItem.Category = 'MemoryLobby'
        } else if (sourceKey === 'sticker') {
          newItem.Category = 'Sticker'
          if (!newItem.Name) newItem.Name = `贴纸 ${newItem.Id}`
        } else if (sourceKey === 'idCardBackground') {
          newItem.Category = 'IdCardBackground'
        } else if (sourceKey !== 'emblem') {
          const cat = newItem.Category || newItem.SubCategory || defaultCategory
          newItem.Category = allowedCategories.includes(cat) ? cat : 'Other'
        }

        // 处理好感物品和好感称号
        if (newItem.Category === 'Favor') {
          if (sourceKey === 'emblem') {
            newItem.Category = 'FavorEmblem'
          } else {
            newItem.Category = 'FavorItem'
          }
        }

        newItem.source = sourceKey

        // 处理学生稀有度
        if (sourceKey === 'students' && newItem.Icon) {
          if (newItem.Icon.endsWith('_sr')) {
            newItem.Rarity = 'SR'
          } else if (newItem.Icon.match(/_swimsuit|_original|_boss|_cnc/)) {
            newItem.Rarity = 'SSR'
          } else if (newItem.Icon.match(/_[a-z]{2,3}$/)) {
            newItem.Rarity = 'R'
          } else {
            newItem.Rarity = 'N'
          }
        }

        // 处理图标
        if (sourceKey === 'students') {
          newItem.Icon = icons[`/src/assets/icon/${newItem.Id}.png`]?.default || ''
        } else if (newItem.Icon) {
          newItem.Icon = icons[`/src/assets/icon/${newItem.Icon}.png`]?.default || ''
        }

        return newItem
      })
    }

    // 批量处理数据
    this.dataLists = {
      items: processData(itemsData, null, 'items'),
      students: processData(studentsData, 'Character', 'students'),
      furniture: processData(furnitureData, 'Furnitures', 'furniture'),
      equipment: processData(equipmentData, 'Equipment', 'equipment'),
      currency: processData(currencyData, 'Other', 'currency'),
      emblem: processData(emblemData, 'Emblem', 'emblem'),
      memoryLobby: processData(memoryLobbyData, 'MemoryLobby', 'memoryLobby'),
      sticker: processData(stickerData, 'Sticker', 'sticker'),
      idCardBackground: processData(idCardBackgroundData, 'IdCardBackground', 'idCardBackground')
    }
  },
}
</script>

<style scoped>
/* 主卡片 */
.function-card {
  max-width: 1400px;
  margin: 20px auto;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px) saturate(120%);
  border: 2px solid rgba(52, 152, 219, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(52, 152, 219, 0.15), 0 4px 16px rgba(174, 214, 241, 0.2);
  overflow: hidden;
  position: relative;
}

.function-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db 0%, #85c1e9 50%, #f8c9d4 100%);
}

.function-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(52, 152, 219, 0.2), 0 8px 24px rgba(174, 214, 241, 0.3);
  border-color: rgba(52, 152, 219, 0.4);
}

/* 头部 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 8px;
}

:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3498db 0%, #5dade2 50%, #f1948a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tips {
  color: #5499c7;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

/* 布局 */
.idlist-container {
  display: flex;
  gap: 24px;
  min-height: 600px;
}

/* 侧边栏 */
.idlist-sidebar {
  width: 260px;
  background: linear-gradient(135deg, #ebf4fd 0%, #d6eaf8 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.1);
  border: 2px solid rgba(174, 214, 241, 0.5);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #2874a6;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #aed6f1;
}

.idlist-menu {
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  padding: 12px 16px !important;
  margin: 4px 0 !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  border: none !important;
  background: transparent !important;
  color: #2874a6 !important;
}

:deep(.el-menu-item:hover) {
  background: rgba(52, 152, 219, 0.15) !important;
  color: #1b4f72 !important;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  display: inline-block;
  width: 20px;
  text-align: center;
}

.menu-text {
  font-weight: 500;
}

/* 主内容区 */
.idlist-main {
  flex: 1;
  min-height: 100%;
}

/* 搜索和筛选 */
.search-section {
  margin-bottom: 24px;
}

.search-input {
  margin-bottom: 12px;
}

:deep(.search-input .el-input__wrapper) {
  border-radius: 16px !important;
  border: 2px solid #aed6f1 !important;
  transition: all 0.3s ease !important;
  padding: 8px 16px !important;
}

:deep(.search-input .el-input__wrapper:hover) {
  border-color: #5dade2 !important;
}

:deep(.search-input .el-input__wrapper.is-focus) {
  border-color: #3498db !important;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15) !important;
}

:deep(.search-input .el-input__inner) {
  font-size: 16px !important;
  height: 40px !important;
  color: #2874a6 !important;
}

:deep(.search-input .el-input__inner::placeholder) {
  color: #85c1e9 !important;
}

:deep(.search-input .el-input__prefix) {
  color: #5dade2 !important;
}

/* 稀有度筛选 */
.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fcff 0%, #ebf4fd 100%);
  border: 1px solid rgba(174, 214, 241, 0.5);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.08);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #2874a6;
  margin-right: 12px;
  white-space: nowrap;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.rarity-checkbox .el-checkbox__input) {
  display: none !important;
}

:deep(.rarity-checkbox .el-checkbox__label) {
  padding: 0 !important;
}

.rarity-badge-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  cursor: pointer;
  transition: opacity 0.2s ease;
  user-select: none;
  background: transparent;
}

.rarity-badge-small.rarity-1 { color: #6c757d; border-color: #6c757d; }
.rarity-badge-small.rarity-2 { color: #28a745; border-color: #28a745; }
.rarity-badge-small.rarity-3 { color: #007bff; border-color: #007bff; }
.rarity-badge-small.rarity-4 { color: #6f42c1; border-color: #6f42c1; }

:deep(.rarity-checkbox.is-checked .rarity-badge-small.rarity-1) {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

:deep(.rarity-checkbox.is-checked .rarity-badge-small.rarity-2) {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

:deep(.rarity-checkbox.is-checked .rarity-badge-small.rarity-3) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

:deep(.rarity-checkbox.is-checked .rarity-badge-small.rarity-4) {
  background: #6f42c1;
  color: white;
  border-color: #6f42c1;
}

.rarity-badge-small:hover {
  opacity: 0.8;
}

/* 子分类筛选简单样式 */
:deep(.sub-category-checkbox .el-checkbox__label) {
  font-size: 13px !important;
  color: #5499c7 !important;
  padding-left: 4px !important;
}

:deep(.sub-category-checkbox.is-checked .el-checkbox__label) {
  color: #2874a6 !important;
  font-weight: 600 !important;
}

.clear-filter-btn {
  background: rgba(52, 152, 219, 0.1) !important;
  border-color: #aed6f1 !important;
  color: #2874a6 !important;
  font-size: 12px !important;
  padding: 4px 12px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.clear-filter-btn:hover {
  background: rgba(52, 152, 219, 0.2) !important;
  border-color: #5dade2 !important;
  transform: translateY(-1px) !important;
}

.search-stats {
  font-size: 14px;
  color: #5499c7;
  text-align: center;
  font-weight: 500;
}

.count {
  font-weight: 700;
  color: #2874a6;
  background: rgba(52, 152, 219, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.filter-info {
  font-size: 12px;
  color: #85c1e9;
  margin-left: 8px;
}

/* 物品列表 */
.idlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* 称号类别使用特殊布局 */
.idlist-list.emblem-layout {
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 16px;
}

.idlist-item {
  background: linear-gradient(135deg, #ffffff 0%, #fbfcfd 100%);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(174, 214, 241, 0.3);
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.08), 0 2px 8px rgba(174, 214, 241, 0.1);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease forwards;
}

/* 称号卡片特殊样式 */
.idlist-item.emblem-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  min-height: 120px;
}

.idlist-item:nth-child(even) {
  background: linear-gradient(135deg, #ffffff 0%, #f8fcff 100%);
}

.idlist-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #85c1e9, #f8c9d4);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.idlist-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(52, 152, 219, 0.15), 0 6px 16px rgba(174, 214, 241, 0.2);
  border-color: #5dade2;
}

.idlist-item:hover::before {
  transform: scaleX(1);
}

.item-icon-wrapper {
  position: relative;
  margin-bottom: 16px;
  text-align: center;
}

/* 称号卡片的图标容器 */
.emblem-item .item-icon-wrapper {
  margin-bottom: 0;
  margin-right: 20px;
  flex-shrink: 0;
}

.idlist-item-icon {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  background: transparent;
  border: none;
  padding: 0;
  transition: transform 0.3s ease;
}

/* 称号图标特殊样式 - 按照实际比例 558:106 ≈ 5.26:1 */
.emblem-item .idlist-item-icon {
  width: 300px;
  height: 57px;
  border-radius: 8px;
  padding: 4px;
  object-fit: contain;
  background: transparent;
  border: none;
}

.idlist-item:hover .idlist-item-icon {
  transform: scale(1.1);
}

.rarity-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.9);
}

.rarity-1 { color: #6c757d; border-color: #6c757d; }
.rarity-2 { color: #28a745; border-color: #28a745; }
.rarity-3 { color: #007bff; border-color: #007bff; }
.rarity-4 { color: #6f42c1; border-color: #6f42c1; }

.idlist-item-info {
  text-align: center;
}

/* 称号卡片的信息区域 */
.emblem-item .idlist-item-info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 称号卡片的元信息布局优化 */
.emblem-item .idlist-item-meta {
  flex-wrap: wrap;
  gap: 12px;
}

.emblem-item .idlist-item-id {
  font-size: 11px;
  padding: 5px 10px;
}

.idlist-item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1b4f72;
  margin-bottom: 8px;
  line-height: 1.2;
}

.idlist-item-desc {
  font-size: 13px;
  color: #5499c7;
  margin-bottom: 12px;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.idlist-item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 8px;
  gap: 8px;
}

.idlist-item-id {
  background: linear-gradient(135deg, #ebf4fd 0%, #d6eaf8 100%);
  color: #2874a6;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Consolas', monospace;
  font-weight: 600;
  border: 1px solid rgba(174, 214, 241, 0.5);
  white-space: nowrap;
  flex-shrink: 0;
}

.idlist-item-category {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}

.copy-hint {
  font-size: 12px;
  color: #85c1e9;
  opacity: 0;
  transition: opacity 0.3s ease;
  text-align: center;
  font-weight: 500;
}

.idlist-item:hover .copy-hint {
  opacity: 1;
  color: #5499c7;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #85c1e9;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
  color: #aed6f1;
}

.empty-state p {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #5499c7;
}

.empty-state span {
  font-size: 14px;
  color: #85c1e9;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: #ebf4fd;
  --el-pagination-button-color: #2874a6;
  --el-pagination-hover-color: #3498db;
  --el-pagination-hover-bg-color: #d6eaf8;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #3498db 0%, #5dade2 100%) !important;
  color: white !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

/* 响应式 */
@media (max-width: 1200px) {
  .idlist-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .idlist-list.emblem-layout {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
}

@media (max-width: 768px) {
  .idlist-list.emblem-layout {
    grid-template-columns: 1fr;
  }

  .emblem-item {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .emblem-item .item-icon-wrapper {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .emblem-item .idlist-item-icon {
    width: 250px;
    height: 48px;
  }

  .emblem-item .idlist-item-info {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .idlist-container {
    flex-direction: column;
  }

  .idlist-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .idlist-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .idlist-item {
    padding: 16px;
  }

  .idlist-item-icon {
    width: 60px;
    height: 60px;
  }
}

/* 动画 */
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

.idlist-item:nth-child(1) { animation-delay: 0.1s; }
.idlist-item:nth-child(2) { animation-delay: 0.2s; }
.idlist-item:nth-child(3) { animation-delay: 0.3s; }
.idlist-item:nth-child(4) { animation-delay: 0.4s; }
.idlist-item:nth-child(5) { animation-delay: 0.5s; }

.menu-icon:hover {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}
</style>