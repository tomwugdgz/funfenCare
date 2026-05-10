/**
 * 独居用户首页 - 适老化极简设计
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import theme from '../utils/theme';

interface ElderHomeScreenProps {
  navigation: any;
}

const ElderHomeScreen: React.FC<ElderHomeScreenProps> = ({ navigation }) => {
  const [sosPressed, setSosPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<any>(null);

  // SOS长按3秒触发
  const handleSOSPressIn = () => {
    setSosPressed(true);
    Vibration.vibrate(100);
    
    // 3秒后触发SOS
    const timer = setTimeout(() => {
      triggerSOS();
    }, 3000);
    
    setPressTimer(timer);
  };

  const handleSOSPressOut = () => {
    setSosPressed(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const triggerSOS = () => {
    Alert.alert(
      '🚨 紧急求助',
      '即将联系您的家人和社区服务中心\n\n长按3秒确认发送',
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: handleSOSPressOut,
        },
        {
          text: '确认求助',
          onPress: () => {
            // TODO: 实际调用SOS API
            Alert.alert('已发送', '求助信息已发送给您的家人');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 时间显示 */}
      <View style={styles.timeSection}>
        <Text style={styles.greeting}>早上好</Text>
        <Text style={styles.time}>08:30</Text>
        <Text style={styles.date}>2026年5月10日 星期日</Text>
      </View>

      {/* SOS按钮 - 占据屏幕1/3 */}
      <View style={styles.sosSection}>
        <TouchableOpacity
          style={[styles.sosButton, sosPressed && styles.sosButtonPressed]}
          onPressIn={handleSOSPressIn}
          onPressOut={handleSOSPressOut}
          activeOpacity={0.7}
        >
          <Text style={styles.sosIcon}>🆘</Text>
          <Text style={styles.sosText}>紧急求助</Text>
          <Text style={styles.sosHint}>长按3秒</Text>
        </TouchableOpacity>
      </View>

      {/* 快捷功能 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('电话陪伴', '正在为您接通陪护员...')}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionText}>电话陪伴</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>找人聊天</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Community')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>兴趣圈子</Text>
        </TouchableOpacity>
      </View>

      {/* 今日状态 */}
      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>今日状态</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>⏰</Text>
            <Text style={styles.statusValue}>07:30</Text>
            <Text style={styles.statusLabel}>起床时间</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>🚶</Text>
            <Text style={styles.statusValue}>正常</Text>
            <Text style={styles.statusLabel}>活动量</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusIcon}>😊</Text>
            <Text style={styles.statusValue}>良好</Text>
            <Text style={styles.statusLabel}>心情</Text>
          </View>
        </View>
      </View>

      {/* 今日服务 */}
      <View style={styles.servicesSection}>
        <Text style={styles.statusTitle}>今日服务</Text>
        <View style={styles.serviceItem}>
          <Text style={styles.serviceTime}>10:00</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>上门打卡</Text>
            <Text style={styles.serviceStatus}>网格员 李阿姨 即将到达</Text>
          </View>
          <View style={[styles.serviceBadge, styles.badgePending]}>
            <Text style={styles.badgeText}>待服务</Text>
          </View>
        </View>
        <View style={styles.serviceItem}>
          <Text style={styles.serviceTime}>15:00</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>电话陪伴</Text>
            <Text style={styles.serviceStatus}>陪聊员 小王</Text>
          </View>
          <View style={[styles.serviceBadge, styles.badgeDone]}>
            <Text style={styles.badgeText}>已预约</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  timeSection: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
  },
  greeting: {
    fontSize: theme.fonts.xl,
    color: theme.colors.textSecondary,
  },
  time: {
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  date: {
    fontSize: theme.fonts.lg,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  sosSection: {
    padding: theme.spacing.lg,
  },
  sosButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sosButtonPressed: {
    backgroundColor: '#CC0000',
    transform: [{ scale: 0.98 }],
  },
  sosIcon: {
    fontSize: 80,
  },
  sosText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  sosHint: {
    fontSize: theme.fonts.lg,
    color: '#FFCCCC',
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionText: {
    fontSize: theme.fonts.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusSection: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  statusTitle: {
    fontSize: theme.fonts.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: theme.fonts.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusLabel: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  servicesSection: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  serviceTime: {
    fontSize: theme.fonts.lg,
    fontWeight: '600',
    color: theme.colors.primary,
    minWidth: 60,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  serviceName: {
    fontSize: theme.fonts.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  serviceStatus: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  serviceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  badgePending: {
    backgroundColor: '#FFF3CD',
  },
  badgeDone: {
    backgroundColor: '#D4EDDA',
  },
  badgeText: {
    fontSize: theme.fonts.xs,
    fontWeight: '600',
  },
});

export default ElderHomeScreen;
