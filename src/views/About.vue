<template>
  <div class="about-container">
    <!-- 左侧关于卡片 -->
    <el-card class="about-card" shadow="hover">
      <div class="about-logo-container">
        <img src="@/assets/ICON_BG_CS_PV4_105_2.jpg" alt="BlueArchiveGM Logo" class="about-logo" />
      </div>
      <div class="about-header">
        <h2>关于 BlueArchiveGM</h2>
      </div>
      <div class="about-content">
        <p><strong>版本：</strong> 1.0.2</p>
        <p><strong>开发者：</strong> KitanoSakura</p>
        <p>
          <strong>项目基于：</strong>
          <a href="https://github.com/gucooing/BaPs/" target="_blank">BaPs</a>
        </p>
        <p>此工具为 GM 控制台，旨在提供便捷的玩家管理功能。</p>
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
      </div>
    </el-card>

    <!-- 右侧更新时间轴卡片 -->
    <el-card class="timeline-card" shadow="hover">
      <h3>Update log</h3>
      <div class="timeline">

        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-15</h4>
            <p>1.0.2 移动端适配</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-14</h4>
            <p>1.0.1 优化KEY读取，实现无key情况下也能使用GM，修复部分问题</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-12</h4>
            <p>1.0.0正式发布，美化UI，优化功能（还没做手机端）</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-11</h4>
            <p>进行了全面的性能优化，提升了加载速度并修复了界面兼容问题。</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-10</h4>
            <p>增加了更多用户自定义功能，并且优化了用户界面，使得操作更加直观。</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon"></div>
          <div class="timeline-content">
            <h4>2025-03-09</h4>
            <p>BlueArchiveGM框架搭建完成，初始版本发布，包含基础功能。</p>
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
/* 移动端样式适配 */
@media screen and (max-width: 768px) {
  .about-container {
    flex-direction: column;
    gap: 20px;
    margin: 20px 12px;
    align-items: stretch;
  }

  /* 左侧卡片移动端适配 */
  .about-card {
    padding: 1.5rem;
    border-radius: 12px;
    margin: 0;
  }

  .about-logo {
    max-width: 80px;
  }

  .about-header h2 {
    font-size: 1.5rem;
  }

  .about-header h2::after {
    width: 40px;
    height: 3px;
    margin: 8px auto 0;
  }

  .about-content {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .about-content p {
    margin: 8px 0;
  }

  .sns-container {
    gap: 15px;
    margin-top: 1.5rem;
    padding-top: 1.2rem;
    flex-wrap: wrap; /* 允许在空间不足时换行 */
    justify-content: space-around;
  }

  .sns-item {
    padding: 8px;
    min-width: 90px;
    justify-content: center;
  }

  .sns-item i {
    margin-right: 6px;
    font-size: 20px !important; /* 覆盖内联样式 */
  }

  .sns-item span {
    font-size: 0.9rem;
  }

  /* 右侧时间轴卡片移动端适配 */
  .timeline-card {
    padding: 1.5rem;
    border-radius: 12px;
    margin: 0;
  }

  .timeline-card h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .timeline {
    gap: 1.2rem;
    padding-left: 2px; /* 为时间轴留出空间 */
  }

  .timeline-item {
    position: relative;
  }

  .timeline-icon {
    width: 10px;
    height: 10px;
    margin-right: 15px;
    flex-shrink: 0;
  }

  /* 添加时间轴连接线 */
  .timeline-item:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 5px; /* (图标宽度 - 线宽) / 2 */
    top: 16px;
    width: 1px;
    height: calc(100% + 1.2rem);
    background: rgba(0, 242, 254, 0.3);
  }

  .timeline-content {
    flex: 1;
  }

  .timeline-content h4 {
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .timeline-content p {
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0;
  }

  /* 优化动画效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
