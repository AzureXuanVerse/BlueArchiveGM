<template>
  <div class="about-container">
    <!-- 左侧关于卡片 -->
    <el-card class="about-card" shadow="hover">
      <div class="about-logo-container">
        <img
          src="@/assets/images/ICON_BG_CS_PV4_105_2.jpg"
          alt="BlueArchiveGM Logo"
          class="about-logo"
        />
      </div>
      <div class="about-header">
        <h2>关于 BlueArchiveGM</h2>
      </div>
      <div class="about-content">
        <p><strong>版本：</strong> 1.0.6</p>
        <p><strong>开发者：</strong> 
          <a href="https://github.com/KitanoSakurana" target="_blank">KitanoSakura（北野桜奈）</a> 
          <a href="https://github.com/AzureXuanVerse" target="_blank">AzureXuanVerse</a>
        </p>
        <p>
          <strong>项目基于：</strong>
          <a href="https://github.com/gucooing/BaPs/" target="_blank">BaPs</a>
        </p>
        <p>
          <strong>有任何问题可前往Issues进行反馈：</strong>
          <a href="https://github.com/PrimeStudentCouncil/BlueArchiveGM/issues" target="_blank"
            >issues</a
          >
        </p>
        <p>
          使用本工具时，请务必遵守相关的开源协议！ 老师您可以修改项目内的任何代码
          但是，请不要修改项目内引导至本仓库的相关入口，徽标等
          以及本工具在此完全免费开源，请勿二次售卖！ 请务必留下版权信息，非常感谢各位老师的使用！
        </p>
      </div>
      <div class="sns-container">
        <a class="sns-item" href="https://discord.gg/kpYzPgv8Ur" target="_blank">
          <i class="bi bi-discord" style="font-size: 24px; color: #5865f2"></i>
          <span>Discord</span>
        </a>
        <a
          class="sns-item"
          href="https://github.com/PrimeStudentCouncil/BlueArchiveGM"
          target="_blank"
        >
          <i class="bi bi-github" style="font-size: 24px; color: #333"></i>
          <span>GitHub</span>
        </a>
        <a class="sns-item" href="mailto:support@bluearchive.cc" target="_blank">
          <i class="bi bi-life-preserver" style="font-size: 24px; color: #f39c12"></i>
          <span>Support</span>
        </a>
        <a class="sns-item" href="https://t.me/tianjg_com" target="_blank">
          <i class="bi bi-telegram" style="font-size: 24px; color: #0088cc"></i>
          <span>Telegram</span>
        </a>
      </div>
    </el-card>

    <!-- 右侧更新时间轴卡片 -->
    <el-card class="timeline-card" shadow="hover">
      <h3>Update log</h3>
      <div class="timeline">

        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-07-11</h4>
            <p>
              1.0.7
              同步更新资源至1.58
            </p>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-06-22</h4>
            <p>
              1.0.6
              适配新的API接口，添加在线人数功能，公告
            </p>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-23</h4>
            <p>1.0.5 新增响应处理，修复某些UI问题，修复在某些情况出现本地无法连接问题，优化文案</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-22</h4>
            <p>1.0.4 新增游戏设置，优化游戏设置，获取验证码UI，着手准备做多语言版本</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-20</h4>
            <p>1.0.3 修复图片问题，优化图片显示，修复给予物品无类型问题，优化ID列表美观度</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-19</h4>
            <p>
              1.0.2
              更新图标为本地，新增ID列表，取代老物品列表（未完善）新增调整学生数值，优化部分名词，优化UI，优化并更新某些奇怪的问题，修复APP白屏问题，
            </p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-14</h4>
            <p>1.0.1 优化KEY读取，实现无key情况下也能使用GM，修复部分问题</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'About',
}
</script>

<style scoped>
.about-container {
  display: flex;
  gap: 30px;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;
}

/* 左侧卡片 */
.about-card {
  max-width: 600px;
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1s ease;
  overflow: hidden;
  position: relative;
}

.about-logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.about-logo {
  max-width: 100px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.about-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.about-header h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
  position: relative;
}

.about-header h2::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  margin: 12px auto 0;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 2px;
}

.about-content {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4a5568;
}

.about-content p {
  margin: 12px 0;
}

.about-content a {
  color: #4facfe;
  text-decoration: none;
  transition: color 0.3s ease;
}

.about-content a:hover {
  color: #00f2fe;
}

.sns-container {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 2rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1.5rem;
}

.sns-item {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #4a5568;
  transition: color 0.3s ease;
}

.sns-item:hover {
  color: #00f2fe;
}

.sns-item i {
  margin-right: 8px;
}

.sns-item span {
  font-size: 1.1rem;
}

/* 右侧更新时间轴卡片 */
.timeline-card {
  max-width: 600px;
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1s ease;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  align-items: center;
}

.timeline-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #00f2fe;
  margin-right: 20px;
}

.timeline-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.timeline-content p {
  font-size: 1rem;
  color: #4a5568;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
