/**
 * 适老化主题配置
 */
export const elderTheme = {
  // 颜色
  colors: {
    primary: '#2196F3',      // 主色调 - 蓝色
    secondary: '#4CAF50',    // 辅助色 - 绿色
    danger: '#FF4444',       // 警告色 - 红色（SOS）
    warning: '#FF9800',      // 提醒色 - 橙色
    success: '#4CAF50',      // 成功色 - 绿色
    background: '#F5F7FA',   // 背景色
    card: '#FFFFFF',         // 卡片色
    text: '#333333',         // 主文字
    textSecondary: '#666666',// 次要文字
    textLight: '#999999',    // 浅色文字
    border: '#E0E0E0',       // 边框色
  },
  // 适老化字体（比标准大1.5倍）
  fonts: {
    xxs: 16,   // 超小小字（原10sp）
    xs: 18,    // 小字（原12sp）
    sm: 20,    // 小中（原13sp）
    md: 22,    // 中等（原14sp）
    lg: 24,    // 大（原16sp）
    xl: 28,    // 超大（原18sp）
    xxl: 32,   // 超大（原20sp）
    xxxl: 40,  // 标题（原24sp）
    hero: 56,  // 主标题
    sos: 72,   // SOS按钮字体
  },
  // 间距
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  // 圆角
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  // 按钮最小尺寸（适老化要求48x48dp以上）
  buttonMinHeight: 56,
  // 按钮最小宽度
  buttonMinWidth: 120,
};

export default elderTheme;
