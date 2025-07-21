<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal" :class="{ 'modal-enter': showAnimation, 'modal-exit': !showAnimation }">
      <div class="modal-header">
        <h2 class="header-title">公告列表</h2>
        <div class="header-line"></div>
      </div>
      <div class="modal-content list-mode">
        <!-- 公告列表 -->
        <div class="announcement-list">
          <div
            v-for="notice in notices"
            :key="notice.NoticeId"
            class="notice-item"
            :class="{ active: notice.NoticeId === selectedNotice.NoticeId }"
            @click="selectNotice(notice)"
          >
            📢 {{ notice.Title || `公告 ${notice.NoticeId}` }}
          </div>
        </div>

        <!-- 公告详情 -->
        <div class="announcement-detail" v-if="selectedNotice">
          <div class="announcement-time">📅 {{ selectedNotice.StartDate }}</div>
          <iframe
            v-if="selectedNotice.Url"
            :src="selectedNotice.Url"
            frameborder="0"
            style="width: 100%; height: 300px"
          ></iframe>
        </div>
      </div>
      <div class="modal-footer">
        <div class="footer-line"></div>
        <button class="ack-button" @click="acknowledge">收到啦</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnouncementModal',
  data() {
    return {
      show: false,
      showAnimation: false,
      notices: [],
      selectedNotice: null,
    }
  },
  methods: {
    open() {
      this.fetchAnnouncements()
    },
    close() {
      this.showAnimation = false
      setTimeout(() => (this.show = false), 400)
    },
    acknowledge() {
      if (this.selectedNotice) {
        localStorage.setItem('announcementLastSeen', this.selectedNotice.NoticeId)
      }
      this.close()
    },
    selectNotice(notice) {
      this.selectedNotice = notice
    },
    fetchAnnouncements() {
      fetch('/Announcements.json')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.Notices)) {
            const sorted = [...data.Notices].sort((a, b) => b.NoticeId - a.NoticeId)
            this.notices = sorted

            const lastSeen = localStorage.getItem('announcementLastSeen')
            const latest = sorted[0]

            // 若已读最新，则不展示
            if (lastSeen && String(latest.NoticeId) === lastSeen) return

            this.selectedNotice = latest
            this.show = true
            this.showAnimation = true
          }
        })
        .catch((err) => console.error('公告获取失败:', err))
    },
  },
  mounted() {
    this.open()
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(140%);
  border-radius: 16px;
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.12);
  max-width: 800px;
  width: 95%;
  overflow: hidden;
  transform-origin: center;
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
  display: flex;
  flex-direction: column;
}
.modal-enter {
  transform: scaleY(0);
  opacity: 0;
  animation: openModal 0.4s forwards;
}
.modal-exit {
  animation: closeModal 0.4s forwards;
}
@keyframes openModal {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}
@keyframes closeModal {
  from {
    transform: scaleY(1);
    opacity: 1;
  }
  to {
    transform: scaleY(0);
    opacity: 0;
  }
}
.modal-header {
  text-align: center;
  padding: 16px 8px 8px;
}
.header-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.header-line {
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  width: 60px;
  margin: 0 auto 8px;
  border-radius: 2px;
}
.modal-content.list-mode {
  display: flex;
  gap: 16px;
  padding: 16px;
}
.announcement-list {
  width: 200px;
  max-height: 300px;
  overflow-y: auto;
  border-right: 1px solid #eee;
  padding-right: 8px;
}
.notice-item {
  padding: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.3s;
}
.notice-item:hover {
  background-color: #f0f9ff;
}
.notice-item.active {
  background-color: #e0f7ff;
  font-weight: bold;
}
.announcement-detail {
  flex: 1;
  padding-left: 8px;
}
.announcement-time {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}
.modal-footer {
  text-align: center;
  padding: 12px 0 16px;
}
.footer-line {
  height: 1px;
  background-color: #ddd;
  margin-bottom: 8px;
}
.ack-button {
  padding: 12px 24px;
  border: none;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.ack-button:hover {
  transform: translateY(-2px);
}
</style>
