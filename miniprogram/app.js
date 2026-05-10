// app.js
App({
  globalData: {
    baseUrl: 'https://api.funfencare.com/api/v1',
    // 开发环境使用本地地址
    // baseUrl: 'http://localhost:8000/api/v1',
    accessToken: null,
    user: null,
    role: 'guardian', // guardian | elder | caregiver
    wsUrl: 'wss://api.funfencare.com/ws',
    // wsUrl: 'ws://localhost:8000/ws',
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('accessToken');
    const user = wx.getStorageSync('user');
    if (token && user) {
      this.globalData.accessToken = token;
      this.globalData.user = JSON.parse(user);
    }
  },

  // 设置用户信息
  setUser(token, user) {
    this.globalData.accessToken = token;
    this.globalData.user = user;
    this.globalData.role = user.role;
    wx.setStorageSync('accessToken', token);
    wx.setStorageSync('user', JSON.stringify(user));
  },

  // 清除登录信息
  clearUser() {
    this.globalData.accessToken = null;
    this.globalData.user = null;
    this.globalData.role = 'guardian';
    wx.removeStorageSync('accessToken');
    wx.removeStorageSync('user');
  },

  // 获取用户信息
  getUser() {
    return this.globalData.user;
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!this.globalData.accessToken;
  },
});
