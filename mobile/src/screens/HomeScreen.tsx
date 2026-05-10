/**
 * 监护人首页 - 实时监控面板
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import theme from '../utils/theme';
import { reportAPI, orderAPI, familyAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [elders, setElders] = useState<any[]>([]);
  const [reports, setReports] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        // 获取关注的老人列表
        const eldersData = await familyAPI.getElders(parsed.id);
        setElders(eldersData);
        // 获取每个老人的健康报告
        const reportsData: any = {};
        for (const elder of eldersData) {
          const report = await reportAPI.getDaily(elder.id);
          reportsData[elder.id] = report;
        }
        setReports(reportsData);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 50) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return '状态良好';
    if (score >= 50) return '需要关注';
    return '需要帮助';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☀️ funfenCare</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatar}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* 老人状态卡片 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我关注的家人</Text>
        {elders.map((elder) => {
          const report = reports[elder.id];
          const score = report?.summary?.activity_score || 0;
          const anomaly = report?.summary?.anomaly_detected || false;

          return (
            <TouchableOpacity
              key={elder.id}
              style={styles.elderCard}
              onPress={() => navigation.navigate('ElderDetail', { elderId: elder.id })}
            >
              <View style={styles.elderHeader}>
                <View style={styles.elderAvatar}>
                  <Text style={styles.elderAvatarText}>👴</Text>
                </View>
                <View style={styles.elderInfo}>
                  <Text style={styles.elderName}>{elder.name || '未设置姓名'}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: anomaly ? theme.colors.danger : getStatusColor(score) }
                  ]}>
                    <Text style={styles.statusText}>
                      {anomaly ? '⚠️ 异常' : getStatusText(score)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 活动数据 */}
              <View style={styles.activityRow}>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>{score}分</Text>
                  <Text style={styles.activityLabel}>活动指数</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>
                    {report?.summary?.wake_time || '--:--'}
                  </Text>
                  <Text style={styles.activityLabel}>起床时间</Text>
                </View>
                <View style={styles.activityItem}>
                  <Text style={styles.activityValue}>
                    {report?.summary?.sleep_time || '--:--'}
                  </Text>
                  <Text style={styles.activityLabel}>入睡时间</Text>
                </View>
              </View>

              {/* AI建议 */}
              {report?.ai_insights && report.ai_insights.length > 0 && (
                <View style={styles.insightsBox}>
                  <Text style={styles.insightsTitle}>💡 AI建议</Text>
                  {report.ai_insights.slice(0, 2).map((insight: string, idx: number) => (
                    <Text key={idx} style={styles.insightText}>• {insight}</Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {elders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
            <Text style={styles.emptyText}>还没有添加家人</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddFamily')}
            >
              <Text style={styles.addButtonText}>+ 添加家人</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 快捷服务 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快捷服务</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => navigation.navigate('OrderService', { type: 'door_check' })}
          >
            <Text style={styles.serviceIcon}>🚪</Text>
            <Text style={styles.serviceName}>上门打卡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => navigation.navigate('OrderService', { type: 'chat' })}
          >
            <Text style={styles.serviceIcon}>📞</Text>
            <Text style={styles.serviceName}>陪聊服务</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => navigation.navigate('OrderService', { type: 'companion' })}
          >
            <Text style={styles.serviceIcon}>👥</Text>
            <Text style={styles.serviceName}>陪护服务</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => navigation.navigate('Reports')}
          >
            <Text style={styles.serviceIcon}>📊</Text>
            <Text style={styles.serviceName}>健康报告</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: theme.fonts.xxl,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatar: {
    fontSize: 32,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  elderCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  elderAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  elderAvatarText: {
    fontSize: 36,
  },
  elderInfo: {
    flex: 1,
  },
  elderName: {
    fontSize: theme.fonts.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: '#fff',
    fontSize: theme.fonts.sm,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityValue: {
    fontSize: theme.fonts.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  activityLabel: {
    fontSize: theme.fonts.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  insightsBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  insightsTitle: {
    fontSize: theme.fonts.md,
    fontWeight: '600',
    color: theme.colors.warning,
    marginBottom: 8,
  },
  insightText: {
    fontSize: theme.fonts.sm,
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fonts.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  addButtonText: {
    color: '#fff',
    fontSize: theme.fonts.lg,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  serviceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: theme.fonts.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default HomeScreen;
