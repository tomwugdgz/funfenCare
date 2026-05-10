// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    user: null,
  },

  onShow() {
    if (!app.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({ user: app.getUser() });
  },

  goFamily() {
    wx.navigateTo({ url: '/pages/family/family' });
  },

  goDevices() {
    wx.showToast({ title: '设备管理开发中', icon: 'none' });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/order/order' });
  },

  goSettings() {
    wx.showToast({ title: '设置开发中', icon: 'none' });
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearUser();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  },
});
