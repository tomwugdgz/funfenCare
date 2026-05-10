// pages/elder-home/elder-home.js 独居用户首页
const app = getApp();
const api = require('../../services/api');

Page({
  data: {
    greeting: '早上好',
    currentTime: '08:30',
    currentDate: '',
    report: {
      wakeTime: '07:30',
      statusText: '正常',
    },
    todayServices: [
      { id: 1, time: '10:00', name: '上门打卡', desc: '网格员 李阿姨 即将到达', status: 'pending' },
      { id: 2, time: '15:00', name: '电话陪伴', desc: '陪聊员 小王', status: 'scheduled' },
    ],
    sosPressed: false,
    sosTimer: null,
  },

  onLoad() {
    this.updateTime();
    // 每分钟更新时间
    this.timer = setInterval(() => this.updateTime(), 60000);
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
    if (this.data.sosTimer) clearTimeout(this.data.sosTimer);
  },

  updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // 设置问候语
    let greeting = '早上好';
    if (hours >= 12 && hours < 18) greeting = '下午好';
    else if (hours >= 18) greeting = '晚上好';
    
    // 设置日期
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`;
    
    this.setData({
      greeting,
      currentTime: `${hours.toString().padStart(2, '0')}:${minutes}`,
      currentDate: dateStr,
    });
  },

  // SOS长按3秒
  onSOSPressIn() {
    this.setData({ sosPressed: true });
    wx.vibrateShort({ type: 'heavy' });
    
    const timer = setTimeout(() => {
      this.triggerSOS();
    }, 3000);
    
    this.setData({ sosTimer: timer });
  },

  onSOSPressOut() {
    this.setData({ sosPressed: false });
    if (this.data.sosTimer) {
      clearTimeout(this.data.sosTimer);
      this.setData({ sosTimer: null });
    }
  },

  triggerSOS() {
    wx.showModal({
      title: '🚨 紧急求助',
      content: '即将联系您的家人和社区服务中心',
      confirmText: '确认求助',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '求助已发送', icon: 'success' });
          // TODO: 调用SOS API
        }
        this.setData({ sosPressed: false });
      }
    });
  },

  callCompanion() {
    wx.showToast({ title: '正在为您接通陪护员...', icon: 'loading', duration: 2000 });
  },

  goChat() {
    wx.showToast({ title: '聊天功能开发中', icon: 'none' });
  },

  goCommunity() {
    wx.showToast({ title: '兴趣圈子开发中', icon: 'none' });
  },
});
