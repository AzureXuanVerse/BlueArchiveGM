<template>
  <el-card class="function-card" shadow="hover">
    <h2>给予玩家全部物品</h2>
    <el-form :model="form" label-width="100px">
      <!-- 玩家ID输入 -->
      <el-form-item label="玩家ID">
        <el-input v-model="form.uid" placeholder="请输入玩家ID">
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

    <!-- 响应提示 -->
    <el-alert
      v-if="response"
      title="响应"
      :type="responseType"
      :description="response"
      show-icon
      class="response-alert"
    ></el-alert>

    <!-- 帮助文档 -->
    <el-collapse class="documentation">
      <el-collapse-item title="使用方法（必看！）">
        <ul class="guide-list">
          <li>提示：玩家不在线或未注册</li>
          <li><code>解决方法：注册或登录当前用户</code></li>
          <li>物品类别列表：</li>
          <li><code>"Material": // 材料</code></li>
          <li><code>"Character": // 学生</code></li>
          <li><code>"Equipment": // 装备</code></li>
          <li><code>"Furniture": // 家具</code></li>
          <li><code>"Favor": // 礼物</code></li>
          <li><code>"Emblem": // 称号</code></li>
        </ul>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import axios from 'axios'
import { User, CollectionTag, Coin } from '@element-plus/icons-vue'

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
      response: '',
      responseType: '', // 成功时为 'success'，错误时为 'error'
      typeOptions: [
        { value: 'None', label: '无' },
        { value: 'Character', label: '学生' },
        { value: 'Currency', label: '货币' },
        { value: 'Equipment', label: '装备' },
        { value: 'Item', label: '物品' },
        { value: 'GachaGroup', label: '卡池' },
        { value: 'Product', label: '商品' },
        { value: 'Shop', label: '商店' },
        { value: 'MemoryLobby', label: '记忆大厅' },
        { value: 'AccountExp', label: '账号经验' },
        { value: 'CharacterExp', label: '学生经验' },
        { value: 'FavorExp', label: '好感经验' },
        { value: 'TSS', label: 'TSS' },
        { value: 'Furniture', label: '家具' },
        { value: 'ShopRefresh', label: '商店刷新' },
        { value: 'LocationExp', label: '地点经验' },
        { value: 'Recipe', label: '配方' },
        { value: 'CharacterWeapon', label: '学生武器' },
        { value: 'ProductMonthly', label: '月度商品' },
        { value: 'CharacterGear', label: '学生装备' },
        { value: 'IdCardBackground', label: '资料背景' },
        { value: 'Emblem', label: '徽章' },
        { value: 'Sticker', label: '贴纸' },
        { value: 'Costume', label: '服饰' },
      ],
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
        const params = new URLSearchParams({
          ...this.form,
          cmd: 'ga',
        }).toString()

        const res = await axios.get(`${baseURL}/cdq/api?${params}`, {
          headers: { Authorization: authKey },
        })

        if (res.data.code === 0) {
          this.responseType = 'success'
          this.$message.success('物品授予成功！')
        } else {
          this.responseType = 'error'
          this.$message.error('操作失败：' + (res.data.message || '请查看响应获取具体错误'))
        }

        this.response = JSON.stringify(res.data, null, 2)
      } catch (error) {
        this.responseType = 'error'
        const errorMsg = error.response?.data?.message || error.message
        this.response = '请求错误：' + errorMsg
        this.$message.error('操作失败，请检查配置')
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

/* 按钮样式 */
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

/* 响应提示 */
.response-alert {
  margin-top: 24px;
  border-radius: 8px;
}

/* 帮助文档 */
.documentation {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-collapse-item__header) {
  padding: 14px 20px;
  color: #4a5568;
  font-weight: 500;
  background: rgba(245, 247, 250, 0.8);
}

:deep(.el-collapse-item__arrow) {
  margin-right: 8px;
  color: #718096;
}

.guide-list {
  padding-left: 24px;
  line-height: 1.8;
}

.guide-list li {
  margin: 10px 0;
}

.guide-list code {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

/* 动画效果 */
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
