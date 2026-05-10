// pages/caregiver/checkin/checkin.js
Page({
  data: {
    orderId: '',
    elderName: '张大爷',
    address: '天河区XX小区3栋502',
    serviceType: '上门打卡',
    serviceTime: '今天 10:00',
    isInRange: false,
    distance: 0,
    photoPath: '',
    status: 'normal',
    notes: '',
    latitude: 0,
    longitude: 0,
    targetLat: 23.1291,
    targetLng: 113.2644,
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId });
    this.getLocation();
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res;
        const distance = this.calcDistance(latitude, longitude, this.data.targetLat, this.data.targetLng);
        this.setData({
          latitude,
          longitude,
          distance: Math.round(distance),
          isInRange: distance <= 200, // 200米范围内
        });
      },
      fail: () => {
        wx.showToast({ title: '无法获取位置', icon: 'none' });
      }
    });
  },

  calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  checkLocation() {
    this.getLocation();
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        this.setData({ photoPath: res.tempFiles[0].tempFilePath });
      }
    });
  },

  onStatusChange(e) {
    this.setData({ status: e.detail.value });
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  submitCheckin() {
    if (!this.data.isInRange) {
      wx.showToast({ title: '请到达服务地点', icon: 'none' });
      return;
    }
    if (!this.data.photoPath) {
      wx.showToast({ title: '请先拍照', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '提交中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '打卡成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }, 1000);
  },
});
