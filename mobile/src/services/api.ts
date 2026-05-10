/**
 * API 服务配置
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api/v1'  // Android 模拟器
  : 'https://api.funfencare.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，清除并跳转登录
      AsyncStorage.removeItem('accessToken');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ===== 认证 API =====
export const authAPI = {
  sendSMS: (phone: string) => 
    api.post('/auth/send-sms', { phone }),
  
  smsLogin: (phone: string, smsCode: string, role: string = 'guardian') => 
    api.post('/auth/sms-login', { phone, sms_code: smsCode, role }),
  
  getMe: () => api.get('/auth/me'),
};

// ===== 设备 API =====
export const deviceAPI = {
  bindDevice: (data: { elder_id: string; device_token: string; device_name?: string }) => 
    api.post('/devices/', data),
  
  reportCSI: (data: { device_id: string; activity_score: number; anomaly_score?: number }) => 
    api.post('/devices/csi/report', data),
  
  getActivity: (deviceId: string, date?: string) => 
    api.get(`/devices/${deviceId}/activity`, { params: { date } }),
  
  getMyDevices: (elderId: string) => 
    api.get(`/devices/my?elder_id=${elderId}`),
};

// ===== 亲情圈 API =====
export const familyAPI = {
  bind: (data: { guardian_id: string; elder_id: string; relationship?: string }) => 
    api.post('/family/bind', data),
  
  getGuardians: (elderId: string) => 
    api.get(`/family/guardians/${elderId}`),
  
  getElders: (guardianId: string) => 
    api.get(`/family/elders/${guardianId}`),
  
  unbind: (guardianId: string, elderId: string) => 
    api.delete(`/family/unbind?guardian_id=${guardianId}&elder_id=${elderId}`),
};

// ===== 订单 API =====
export const orderAPI = {
  create: (data: { elder_id: string; guardian_id: string; service_type: string; scheduled_at: string; notes?: string }) => 
    api.post('/orders/', data),
  
  getById: (orderId: string) => 
    api.get(`/orders/${orderId}`),
  
  getList: (params: { user_id?: string; elder_id?: string; status?: string; service_type?: string }) => 
    api.get('/orders/list', { params }),
  
  update: (orderId: string, data: any) => 
    api.put(`/orders/${orderId}`, data),
  
  getStats: (elderId?: string) => 
    api.get('/orders/stats', { params: { elder_id: elderId } }),
};

// ===== 报告 API =====
export const reportAPI = {
  getDaily: (userId: string, date?: string) => 
    api.get(`/reports/daily/${userId}`, { params: { date } }),
};

export default api;
