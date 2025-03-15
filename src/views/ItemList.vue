<template>
  <el-card class="function-card" shadow="hover">
    <h2>物品列表</h2>
    <p>Tips：点击卡片可以复制ID哦 ~</p>

    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索物品（名称、描述或ID）"
      class="search-input"
      @input="filterItems"
    />

    <div class="item-list">
      <div
        v-for="(item, index) in paginatedItems"
        :key="index"
        class="item"
        @click="copyToClipboard(item.Id)"
      >
        <img :src="item.Icon" :alt="item.Name" class="item-icon" />
        <div class="item-info">
          <div class="item-name">{{ item.Name }}</div>
          <div class="item-desc">{{ item.Desc }}</div>
          <div class="item-id">ID: {{ item.Id }}</div>
        </div>
      </div>
    </div>

    <!-- 分页控件，支持输入页码跳转 -->
    <el-pagination
      background
      layout="prev, pager, next, jumper"
      :total="filteredItems.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
      class="pagination"
      :force-small-pager="true"
    />
  </el-card>
</template>

<script>
import items from '@/assets/items.json'

export default {
  name: 'ItemList',
  data() {
    return {
      items: Array.isArray(items) ? items : [], // 确保 items 是数组
      currentPage: 1, // 当前页
      pageSize: 12, // 每页显示的物品数量
      searchQuery: '', // 搜索框输入的内容
      filteredItems: Array.isArray(items) ? items : [], // 过滤后的物品列表
    }
  },
  computed: {
    // 计算当前页显示的物品
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredItems.slice(start, end)
    },
  },
  methods: {
    // 处理分页变更
    handlePageChange(page) {
      this.currentPage = page
    },

    // 复制 ID 到剪贴板
    copyToClipboard(id) {
      const textToCopy = id.toString()
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.$message.success(`ID ${id} 已复制！`)
        })
        .catch((err) => {
          this.$message.error('复制失败')
          console.error(err)
        })
    },

    // 过滤物品列表
    filterItems() {
      if (!this.searchQuery) {
        this.filteredItems = this.items
      } else {
        this.filteredItems = this.items.filter((item) => {
          const searchText = this.searchQuery.toLowerCase()
          return (
            item.Name.toLowerCase().includes(searchText) ||
            item.Desc.toLowerCase().includes(searchText) ||
            item.Id.toString().includes(searchText)
          )
        })
      }
      this.currentPage = 1 // 搜索后，重置为第一页
    },
  },
  watch: {
    // 当搜索框内容发生变化时，重新过滤物品列表
    searchQuery() {
      this.filterItems()
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 900px;
  margin: 40px auto;
  animation: fadeIn 1s ease;
  padding-bottom: 20px;
}

.search-input {
  margin-bottom: 20px;
  width: 100%;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  height: 220px;
  text-align: center;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item:hover {
  background-color: #f1f1f1;
  transform: translateY(-2px);
  box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.15);
}

.item-icon {
  width: 100%;
  height: 120px;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  background-color: #fff;
}

.item-info {
  margin-top: 10px;
  height: 80px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  color: #1e90ff;
  height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-desc {
  font-size: 14px;
  color: #666;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.item-id {
  font-size: 12px;
  color: #aaa;
  height: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .function-card {
    max-width: 100%;
    margin: 20px 0;
    width: 100%;
  }

  .item-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
    margin: 12px 0;
    justify-content: center;
  }

  /* 分页器样式 */
  .pagination {
    margin-top: 16px;
    width: 100%;
  }

  :deep(.el-pagination) {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
  }

  :deep(.el-pagination .el-pager) {
    display: flex !important;
    margin: 0;
    gap: 8px;
  }

  /* 修改页码显示逻辑 */
  :deep(.el-pagination .el-pager li) {
    display: none !important;
  }

  :deep(.el-pagination .el-pager li.is-active),
  :deep(.el-pagination .el-pager li.more),
  :deep(.el-pagination .el-pager li:last-child) {
    display: inline-flex !important;
  }

  :deep(.el-pagination .el-pager li),
  :deep(.el-pagination button.btn-prev),
  :deep(.el-pagination button.btn-next) {
    display: inline-flex !important;
    justify-content: center;
    align-items: center;
    min-width: 32px;
    height: 32px;
    margin: 0;
    padding: 0;
    font-size: 14px;
    border-radius: 4px;
  }

  :deep(.el-pagination__jump) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px 0 0 0;
    font-size: 14px;
  }

  :deep(.el-pagination .el-input) {
    width: 50px;
    margin: 0 8px;
  }

  :deep(.el-pagination .el-input__inner) {
    height: 32px;
    padding: 0 4px;
    text-align: center;
    border-radius: 4px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .item-list {
    grid-template-columns: repeat(2, 1fr);
    padding: 10px;
  }
}
</style>