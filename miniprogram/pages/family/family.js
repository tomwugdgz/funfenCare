// pages/family/family.js
const app = getApp();
const api = require('../../services/api');

Page({
  data: {
    phone: '',
    relationIndex: 0,
    relations: ['子女', '配偶', '亲戚', '朋友', '邻居'],
    familyList: [],
  },

  onShow() {
    const user = app.getUser();
    if (user) {
      this.loadFamilyList(user.id);
    }
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onRelationChange(e) {
    this.setData({ relationIndex: e.detail.value });
  },

  async loadFamilyList(guardianId) {
    try {
      const elders = await api.getElders(guardianId);
      this.setData({ familyList: elders.map(e => ({ ...e, role: 'elder' })) });
    } catch (err) {
      console.error('加载家人列表失败:', err);
    }
  },

  async bindFamily() {
    const { phone, relationIndex, relations } = this.data;
    if (phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    try {
      // TODO: 实际应该调用后端API
      wx.showToast({ title: '添加成功', icon: 'success' });
      this.setData({ phone: '' });
    } catch (err) {
      wx.showToast({ title: '添加失败', icon: 'none' });
    }
  },
});
