// pages/caregiver/dashboard/caregiver-dashboard.js
const app = getApp();
const api = require('../../../services/api');

Page({
  data: {
    level: 2,
    levelName: '认证',
    todayOrders: 0,
    completedOrders: 0,
    todayEarning: 0,
    availableOrders: [],
  },

  onShow() {
    this.loadAvailableOrders();
  },

  async loadAvailableOrders() {
    try {
      // TODO: 调用后端API获取可接订单
      const mockOrders = [
        {
          id: 'order_001',
          typeName: '上门打卡',
          distance: '1.2km',
          time: '今天 10:00',
          address: '天河区XX小区3栋502',
          price: 30,
          notes: '请敲门确认安全即可',
        },
        {
          id: 'order_002',
          typeName: '陪聊服务',
          distance: '2.5km',
          time: '今天 14:00',
          address: '越秀区XX路88号',
          price: 50,
          notes: '老人喜欢戏曲，可以聊聊戏曲',
        },
        {
          id: 'order_003',
          typeName: '陪护服务',
          distance: '3.8km',
          time: '明天 09:00',
          address: '海珠区XX花园12栋',
          price: 100,
          notes: '陪同去医院体检',
        },
      ];
      this.setData({ availableOrders: mockOrders });
    } catch (err) {
      console.error('加载订单失败:', err);
    }
  },

  acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认接单',
      content: '确定接此订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            availableOrders: this.data.availableOrders.filter(o => o.id !== orderId),
            todayOrders: this.data.todayOrders + 1,
          });
          wx.showToast({ title: '接单成功', icon: 'success' });
          // 跳转到打卡页面
          wx.navigateTo({ url: `/pages/caregiver/checkin/checkin?orderId=${orderId}` });
        }
      }
    });
  },
});
