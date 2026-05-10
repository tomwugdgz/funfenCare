// pages/home/home.js
const app = getApp();
const api = require('../../services/api');

Page({
  data: {
    user: null,
    elders: [],
    loading: false,
  },

  onShow() {
    if (!app.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.loadElders();
  },

  async loadElders() {
    this.setData({ loading: true });
    try {
      const user = app.getUser();
      this.setData({ user });
      
      // 获取关注的老人列表
      const elders = await api.getElders(user.id);
      
      // 获取每个老人的报告
      const eldersWithStatus = [];
      for (const elder of elders) {
        try {
          const report = await api.getDailyReport(elder.id);
          const score = report?.summary?.activity_score || 0;
          eldersWithStatus.push({
            ...elder,
            score,
            anomaly: report?.summary?.anomaly_detected || false,
            wakeTime: report?.summary?.wake_time || '--:--',
            sleepTime: report?.summary?.sleep_time || '--:--',
            statusText: this.getStatusText(score),
            insights: report?.ai_insights || [],
          });
        } catch (e) {
          eldersWithStatus.push({
            ...elder,
            score: 0,
            anomaly: false,
            wakeTime: '--:--',
            sleepTime: '--:--',
            statusText: '暂无数据',
            insights: [],
          });
        }
      }
      
      this.setData({ elders: eldersWithStatus });
    } catch (err) {
      console.error('加载数据失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  getStatusText(score) {
    if (score >= 80) return '状态良好';
    if (score >= 50) return '需要关注';
    return '需要帮助';
  },

  goElderDetail(e) {
    const elderId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/monitor/monitor?elderId=${elderId}` });
  },

  goProfile() {
    wx.switchTab({ url: '/pages/profile/profile' });
  },

  goAddFamily() {
    wx.navigateTo({ url: '/pages/family/family' });
  },

  goOrderService(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: `/pages/order/order?type=${type}` });
  },

  goReports() {
    wx.navigateTo({ url: '/pages/report/report' });
  },
});
