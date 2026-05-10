// pages/order/order.js
const app = getApp();
const api = require('../../services/api');

Page({
  data: {
    serviceTypes: ['上门打卡', '陪聊服务', '陪护服务'],
    typeIndex: 0,
    selectedTime: '请选择服务时间',
    notes: '',
    timeRange: [['周一', '周二', '周三', '周四', '周五', '周六', '周日'], ['上午', '下午', '晚上']],
    timeIndex: [0, 0],
  },

  onLoad(options) {
    if (options.type) {
      const idx = { door_check: 0, chat: 1, companion: 2 }[options.type] || 0;
      this.setData({ typeIndex: idx });
    }
  },

  onTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  onTimeChange(e) {
    const day = this.data.timeRange[0][e.detail.value[0]];
    const period = this.data.timeRange[1][e.detail.value[1]];
    this.setData({
      timeIndex: e.detail.value,
      selectedTime: `${day} ${period}`,
    });
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  async submitOrder() {
    const user = app.getUser();
    const typeMap = ['door_check', 'chat', 'companion'];
    try {
      await api.createOrder({
        elder_id: user.id,
        guardian_id: user.id,
        service_type: typeMap[this.data.typeIndex],
        scheduled_at: new Date().toISOString(),
        notes: this.data.notes,
      });
      wx.showToast({ title: '预约成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      wx.showToast({ title: '预约失败', icon: 'none' });
    }
  },
});
