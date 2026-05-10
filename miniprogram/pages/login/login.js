// pages/login/login.js
const app = getApp();
const api = require('../../services/api');

Page({
  data: {
    phone: '',
    code: '',
    role: 'guardian',
    countdown: 0,
    loading: false,
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  onRoleChange(e) {
    this.setData({ role: e.currentTarget.dataset.role });
  },

  async sendCode() {
    const { phone } = this.data;
    if (phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    try {
      await api.sendSMS(phone);
      wx.showToast({ title: '验证码已发送', icon: 'success' });
      this.setData({ countdown: 60 });
      const timer = setInterval(() => {
        this.setData({ countdown: this.data.countdown - 1 });
        if (this.data.countdown <= 0) clearInterval(timer);
      }, 1000);
    } catch (err) {
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  async handleLogin() {
    const { phone, code, role } = this.data;
    if (phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (code.length < 4) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      const res = await api.smsLogin(phone, code, role);
      app.setUser(res.access_token, res.user);
      
      // 根据角色跳转不同页面
      if (role === 'elder') {
        wx.reLaunch({ url: '/pages/elder-home/elder-home' });
      } else if (role === 'caregiver') {
        wx.reLaunch({ url: '/pages/home/home' });
      } else {
        wx.reLaunch({ url: '/pages/home/home' });
      }
    } catch (err) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
