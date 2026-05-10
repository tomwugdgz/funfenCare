/**
 * API 服务（微信小程序版）
 */
const app = getApp();

const request = (method, url, data = {}) => {
  return new Promise((resolve, reject) => {
    const token = app.globalData.accessToken;
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          app.clearUser();
          wx.reLaunch({ url: '/pages/login/login' });
          reject(new Error('登录已过期'));
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail(err) {
        reject(new Error('网络请求失败'));
      }
    });
  });
};

// ===== 认证 API =====
const sendSMS = (phone) => request('POST', '/auth/send-sms', { phone });
const smsLogin = (phone, smsCode, role) => request('POST', '/auth/sms-login', { phone, sms_code: smsCode, role });

// ===== 设备 API =====
const bindDevice = (data) => request('POST', '/devices/', data);
const reportCSI = (data) => request('POST', '/devices/csi/report', data);
const getActivity = (deviceId, date) => request('GET', `/devices/${deviceId}/activity`, { date });
const getMyDevices = (elderId) => request('GET', '/devices/my', { elder_id: elderId });

// ===== 亲情圈 API =====
const bindFamily = (data) => request('POST', '/family/bind', data);
const getGuardians = (elderId) => request('GET', `/family/guardians/${elderId}`);
const getElders = (guardianId) => request('GET', `/family/elders/${guardianId}`);
const unbindFamily = (guardianId, elderId) => request('DELETE', `/family/unbind`, { guardian_id: guardianId, elder_id: elderId });

// ===== 订单 API =====
const createOrder = (data) => request('POST', '/orders/', data);
const getOrder = (orderId) => request('GET', `/orders/${orderId}`);
const getOrderList = (params) => request('GET', '/orders/list', params);
const updateOrder = (orderId, data) => request('PUT', `/orders/${orderId}`, data);
const getOrderStats = (elderId) => request('GET', '/orders/stats', { elder_id: elderId });

// ===== 报告 API =====
const getDailyReport = (userId, date) => request('GET', `/reports/daily/${userId}`, { date });

module.exports = {
  sendSMS,
  smsLogin,
  bindDevice,
  reportCSI,
  getActivity,
  getMyDevices,
  bindFamily,
  getGuardians,
  getElders,
  unbindFamily,
  createOrder,
  getOrder,
  getOrderList,
  updateOrder,
  getOrderStats,
  getDailyReport,
};
