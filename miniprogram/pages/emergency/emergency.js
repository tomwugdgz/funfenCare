// pages/emergency/emergency.js
Page({
  data: {
    selectedType: '',
    contacts: [
      { id: 1, name: '李明', relation: '儿子', phone: '13800138001' },
      { id: 2, name: '王芳', relation: '女儿', phone: '13800138002' },
      { id: 3, name: '社区服务中心', relation: '24小时热线', phone: '12345' },
    ],
  },

  selectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  callContact(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({ phoneNumber: phone });
  },

  triggerSOS() {
    wx.makePhoneCall({ phoneNumber: '120' });
  },
});
