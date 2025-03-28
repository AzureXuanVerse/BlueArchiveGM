<template>
  <el-card class="function-card" shadow="hover">
    <h2>物品列表</h2>
    <p>Tips：点击卡片可以复制ID哦 ~</p>

    <div class="idlist-container">
      <!-- 侧边栏 -->
      <div class="idlist-sidebar">
        <el-menu class="idlist-menu" :default-active="selectedSource" @select="handleSourceSelect">
          <el-menu-item v-for="option in sourceOptions" :key="option.value" :index="option.value">
            {{ option.label }}
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区 -->
      <div class="idlist-main">
        <!-- 搜索框 -->
        <el-input
          v-model="searchQuery"
          placeholder="搜索物品（名称、描述或ID）"
          class="search-input"
        >
          <template #prefix>
            <i class="bi bi-search-heart"></i>
          </template>
        </el-input>

        <!-- 数据列表 -->
        <div class="idlist-list">
          <div
            v-for="(item, index) in paginatedItems"
            :key="index"
            class="idlist-item"
            @click="copyToClipboard(item.Id)"
          >
            <img :src="item.Icon" :alt="item.Name" class="idlist-item-icon" />
            <div class="idlist-item-info">
              <div class="idlist-item-name">{{ item.Name }}</div>
              <div class="idlist-item-desc">{{ item.Desc }}</div>
              <div class="idlist-item-id">ID: {{ item.Id }}</div>
              <div class="idlist-item-source">分类：{{ item.Category }}</div>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <el-pagination
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
import itemsData from '@/assets/items.json'
import studentsData from '@/assets/students.json'
import furnitureData from '@/assets/furniture.json'
import equipmentData from '@/assets/equipment.json'
import currencyData from '@/assets/currency.json'

export default {
  name: 'IdList',
  data() {
    return {
      searchQuery: '',
      // 默认选择综合
      selectedSource: 'combined',
      pageSize: 10,
      currentPage: 1,
      // 侧边栏选项：注意家具的选项 value 为 "Furniture"，JSON 中实际读取到的是 "Furnitures"
      sourceOptions: [
        { value: 'combined', label: '综合' },
        { value: 'Material', label: '材料' },
        { value: 'Character', label: '学生' },
        { value: 'Equipment', label: '装备' },
        { value: 'Furniture', label: '家具' },
        { value: 'Favor', label: '礼物' },
        { value: 'Emblem', label: '称号' },
        { value: 'Other', label: '其他' },
      ],
      // 各数据源存放数组
      itemsList: [],
      studentsList: [],
      furnitureList: [],
      equipmentList: [],
      currencyList: [],
    }
  },
  computed: {
    // 合并所有数据源
    combinedItems() {
      return [
        ...this.itemsList,
        ...this.studentsList,
        ...this.furnitureList,
        ...this.equipmentList,
        ...this.currencyList,
      ]
    },
    // 根据选中分类过滤数据：
    // 当选中 "combined" 时，返回所有数据按 ID 升序排序；
    // 当选中 "Furniture" 时，匹配 JSON 中的 "Furnitures"；
    // 其它则直接按照 item.Category 匹配
    currentSourceItems() {
      if (this.selectedSource === 'combined') {
        return this.combinedItems.slice().sort((a, b) => a.Id - b.Id)
      } else if (this.selectedSource === 'Furniture') {
        return this.combinedItems.filter((item) => item.Category === 'Furnitures')
      } else {
        return this.combinedItems.filter((item) => item.Category === this.selectedSource)
      }
    },
    // 搜索过滤
    filteredItems() {
      const query = this.searchQuery.toLowerCase()
      return this.currentSourceItems.filter((item) => {
        return (
          (item.Name && item.Name.toLowerCase().includes(query)) ||
          (item.Desc && item.Desc.toLowerCase().includes(query)) ||
          (item.Id && item.Id.toString().includes(query))
        )
      })
    },
    // 分页数据
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
      navigator.clipboard
        .writeText(id.toString())
        .then(() => {
          this.$message.success(`ID ${id} 已复制！`)
        })
        .catch((err) => {
          this.$message.error('复制失败')
          console.error(err)
        })
    },
    handleSourceSelect(key) {
      this.selectedSource = key
      this.currentPage = 1
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
  },
  async created() {
    // 动态加载图标
    const icons = import.meta.glob('@/assets/icon/*.png', { eager: true })
    // 指定需要读取的键
    const keys = [
      'Id',
      'Rarity',
      'Icon',
      'Name',
      'Desc',
      'Category',
      'SubCategory',
      'DevName',
      'School',
      'Club',
      'FamilyName',
      'PersonalName',
      'SchoolYear',
      'CharacterAge',
      'Birthday',
      'CharacterSSRNew',
      'ProfileIntroduction',
      'Hobby',
      'CharacterVoice',
      'Illustrator',
      'Designer',
      'CharHeightMetric',
      'CharHeightImperial',
    ]
    // 允许的分类：注意家具 JSON 中分类为 "Furnitures"，学生默认分类改为 "Character"
    const allowedCategories = [
      'Material',
      'Character',
      'Equipment',
      'Furnitures',
      'Favor',
      'Emblem',
    ]
    // 通用处理函数
    const processData = (data, defaultCategory = null, sourceKey) => {
      return data.map((item) => {
        const newItem = {}
        keys.forEach((key) => {
          if (item[key] !== undefined) {
            newItem[key] = item[key]
          }
        })
        // 如果没有 Category，则使用 SubCategory 或默认值
        let cat = newItem.Category || newItem.SubCategory || defaultCategory
        // 如果不在允许的分类内，则归并到 "Other"
        newItem.Category = allowedCategories.includes(cat) ? cat : 'Other'
        newItem.source = sourceKey
        // 对于学生数据，使用默认构造 Icon
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
    // 分别处理 JSON 文件
    this.itemsList = processData(itemsData, null, 'items')
    // 学生数据默认分类修改为 "Character"
    this.studentsList = processData(studentsData, 'Character', 'students')
    // 家具数据保持 sourceKey 为 "Furnitures"
    this.furnitureList = processData(furnitureData, '家具', 'Furnitures')
    this.equipmentList = processData(equipmentData, '装备', 'equipment')
    this.currencyList = processData(currencyData, '货币', 'currency')
  },
}
</script>

<style scoped>
/* 主卡片样式 */
.function-card {
  max-width: 1250px;
  margin: 10px auto 20px;
  animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  padding: 20px;
  background: rgba(255, 255, 255, 0.86) !important;
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
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.16),
    0 6px 32px -4px rgba(0, 0, 0, 0.12),
    inset 0 0 16px rgba(255, 255, 255, 0.5);
}

/* 标题 */
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

/* 侧边栏样式 */
.idlist-container {
  display: flex;
  gap: 20px;
}
.idlist-sidebar {
  width: 220px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff, #f7f7f7);
  border: 1px solid #eaeaea;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 侧边栏菜单 */
.idlist-menu {
  border: none;
  background: transparent;
}
.idlist-menu :deep(.el-menu-item) {
  padding: 12px 16px;
  margin: 5px 0;
  border-radius: 6px;
  transition: background-color 0.3s;
}
.idlist-menu :deep(.el-menu-item:hover),
.idlist-menu :deep(.is-active) {
  background-color: #e6f7ff;
}

/* 主内容区 */
.idlist-main {
  flex: 1;
  padding: 0 10px;
}

/* 搜索框样式 */
.search-input {
  margin-bottom: 20px;
  width: 100%;
}
.search-input .el-input__inner {
  border: 1px solid #d9d9d9;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 16px;
  transition: all 0.3s ease;
}
.search-input .el-input__inner:focus {
  border-color: #4facfe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

/* 数据列表 */
.idlist-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 30px;
  animation: fadeInItems 1s ease-in-out;
}
.idlist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}
.idlist-item:hover {
  background-color: #f1f1f1;
  transform: translateY(-4px);
  box-shadow: 0 12px 16px rgba(0, 0, 0, 0.1);
}
.idlist-item-icon {
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  background-color: #fff;
}
.idlist-item-info {
  margin-top: 10px;
}
.idlist-item-name {
  font-size: 16px;
  font-weight: bold;
  color: #1e90ff;
}
.idlist-item-desc {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}
.idlist-item-id {
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
}
.idlist-item-source {
  margin-top: 8px;
  font-size: 12px;
  color: #555;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  animation: fadeIn 1s ease;
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
</style>
