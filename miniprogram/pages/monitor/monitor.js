// pages/monitor/monitor.js
const app = getApp();
const api = require('../../services/api');

Page({
  data: {
    elderId: '',
    elderName: '',
    date: '',
    activityScore: 0,
    anomaly: false,
    statusClass: 'good',
    insights: [],
    activityData: [],
  },

  onLoad(options) {
    this.setData({ elderId: options.elderId });
    const now = new Date();
    this.setData({ date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}` });
    this.loadData();
  },

  async loadData() {
    try {
      const report = await api.getDailyReport(this.data.elderId);
      const score = report?.summary?.activity_score || 0;
      this.setData({
        activityScore: score,
        anomaly: report?.summary?.anomaly_detected || false,
        statusClass: score >= 80 ? 'good' : score >= 50 ? '' : 'danger',
        insights: report?.ai_insights || ['暂无AI分析数据'],
        activityData: this.generateChartData(report),
      });
    } catch (err) {
      this.setData({ insights: ['数据加载失败'] });
    }
  },

  generateChartData(report) {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({ hour: i, activity: Math.random() * 0.8 });
    }
    return data;
  },
});
