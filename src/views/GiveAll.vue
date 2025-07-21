<template>
  <el-card class="function-card" shadow="hover">
    <h2>给予玩家全部物品</h2>
    <el-form :model="form" label-width="100px">
      <!-- 老师UID输入 -->
      <el-form-item label="老师UID">
        <el-input
          v-model="form.uid"
          placeholder="请输入老师的UID"
          @input="form.uid = form.uid.replace(/\D/g, '')"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 物品类型输入 改为下拉菜单 -->
      <el-form-item label="物品类型">
        <el-select v-model="form.t" placeholder="请选择物品类型">
          <el-option
            v-for="option in typeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <!-- 数量输入 -->
      <el-form-item label="数量">
        <el-input-number v-model="form.num" :min="1">
          <template #prefix>
            <el-icon><Coin /></el-icon>
          </template>
        </el-input-number>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleGiveAll">立即授予全部</el-button>
      </el-form-item>
    </el-form>

    <!-- 响应处理卡片 -->
    <div v-if="response" class="respond-card">
      <div class="respond-card-container">
        <div class="header">
          <img class="header-image" :src="banner1" alt="操作结果" />
        </div>
        <div class="body">
          <div class="message-box">
            <p class="message-text">老师！这是您的操作结果：</p>
            <p class="code">{{ response }}</p>
            <p class="message-text">请检查是否生效</p>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import axios from 'axios'
import { User, CollectionTag, Coin } from '@element-plus/icons-vue'
import banner1 from '@/assets/images/bg1.ccb168ef.jpg'

export default {
  name: 'GiveAll',
  components: {
    User,
    CollectionTag,
    Coin,
  },
  data() {
    return {
      form: {
        uid: '',
        t: '',
        num: 1,
      },
      response: '', // 只保存接口返回的 msg 字段
      typeOptions: [
        // { value: 'None', label: '无' },
        // { value: 'Character', label: '学生' },
        // { value: 'Currency', label: '货币' },
        // { value: 'Equipment', label: '装备' },
        // { value: 'Item', label: '物品' },
        // { value: 'GachaGroup', label: '卡池' },
        // { value: 'Product', label: '商品' },
        // { value: 'Shop', label: '商店' },
        // { value: 'AccountExp', label: '账号经验' },
        // { value: 'CharacterExp', label: '学生经验' },
        // { value: 'FavorExp', label: '好感经验' },
        // { value: 'TSS', label: 'TSS' },
        // { value: 'Furniture', label: '家具' },
        // { value: 'ShopRefresh', label: '商店刷新' },
        // { value: 'LocationExp', label: '地点经验' },
        // { value: 'Recipe', label: '配方' },
        { value: 'All', label: '全部物品' },
        { value: 'Material', label: '材料' },
        { value: 'Character', label: '学生' },
        { value: 'Equipment', label: '装备' },
        { value: 'Furniture', label: '家具' },
        { value: 'Favor', label: '礼物' },
        { value: 'Emblem', label: '称号' },
        { value: 'MemoryLobby', label: '记忆大厅' },
        { value: 'Sticker', label: '贴纸' },
      ],
      banner1: banner1,
    }
  },
  methods: {
    async handleGiveAll() {
      const baseURL = localStorage.getItem('serverAddress')
      const authKey = localStorage.getItem('serverAuthKey')
      if (!baseURL) {
        this.$message.error('请先在首页保存服务器地址')
        return
      }
      try {
        const params = {
          cmd: 'giveAll',
          uid: this.form.uid,
          type: this.form.t,
          num: this.form.num,
        }

        const config = { params }
        if (authKey) config.headers = { Authorization: authKey }
        
        const res = await axios.get(`${baseURL}/cdq/api`, config)

        if (res.data.code === 0) {
          this.$message.success('物品授予成功！')
        } else {
          this.$message.error('操作失败：' + (res.data.message || '请查看响应获取具体错误'))
        }
        // 仅获取返回的 msg 字段
        this.response = res.data.msg
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message
        this.$message.error('操作失败，请检查配置')
        this.response = errorMsg
      }
    },
  },
}
</script>

<style scoped>
.function-card {
  max-width: 680px;
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

/* 标题样式 */
:deep(h2) {
  color: #2c3e50 !important;
  font-weight: 600;
  margin: 0 24px 24px;
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

/* 表单元素 */
:deep(.el-form-item__label) {
  color: #4a5568;
  font-weight: 500;
  letter-spacing: 0.5px;
}

:deep(.el-input__prefix) {
  left: 12px;
  color: #a0aec0;
}

:deep(.el-input__inner:focus) {
  border-color: #4facfe;
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

:deep(.el-button) {
  width: 60%;
  height: 40px;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -4px rgba(79, 172, 254, 0.4);
}

/* 响应卡片样式 */
.respond-card {
  display: flex;
  align-items: center;
  padding: 8px;
  color: #666;
  font-size: 14px;
  margin-top: 1rem; /* 调整响应卡片与表单间距 */
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

.body {
  padding: 30px 20px;
}

.message-box {
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.15);
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

/* 移动端适配 */
@media (max-width: 768px) {
  .function-card {
    margin: 1rem;
    border-radius: 12px;
  }

  :deep(h2) {
    font-size: 1.4rem;
    margin: 0 16px 20px;
  }

  :deep(.el-input__inner) {
    height: 44px;
    padding-left: 38px;
  }
}
</style>
