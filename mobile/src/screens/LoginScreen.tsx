/**
 * 登录页面 - 适老化设计
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../utils/theme';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const handleSendCode = async () => {
    if (phone.length !== 11) {
      Alert.alert('提示', '请输入正确的11位手机号');
      return;
    }
    setSending(true);
    try {
      await authAPI.sendSMS(phone);
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      Alert.alert('成功', '验证码已发送，请注意查收');
    } catch (error: any) {
      Alert.alert('错误', error.message || '发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }
    if (code.length < 4) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.smsLogin(phone, code, 'guardian');
      // 保存Token和用户信息
      await AsyncStorage.setItem('accessToken', response.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      // 跳转到首页
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeTabs' }],
      });
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>☀️</Text>
        <Text style={styles.title}>funfenCare</Text>
        <Text style={styles.subtitle}>让远方的家人安心</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>手机号</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入手机号"
          placeholderTextColor={theme.colors.textLight}
          keyboardType="phone-pad"
          maxLength={11}
          value={phone}
          onChangeText={setPhone}
          fontSize={theme.fonts.lg}
        />

        <Text style={styles.label}>验证码</Text>
        <View style={styles.codeRow}>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="请输入验证码"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            fontSize={theme.fonts.lg}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (sending || countdown > 0) && styles.sendButtonDisabled
            ]}
            onPress={handleSendCode}
            disabled={sending || countdown > 0}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : countdown > 0 ? (
              <Text style={styles.sendButtonText}>{countdown}秒</Text>
            ) : (
              <Text style={styles.sendButtonText}>获取验证码</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>登 录</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.elderButton}
          onPress={() => navigation.navigate('ElderLogin')}
        >
          <Text style={styles.elderButtonText}>我是老人，我要登录</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: theme.fonts.hero,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.fonts.lg,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: theme.fonts.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    color: theme.colors.text,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeInput: {
    flex: 1,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    minWidth: 120,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textLight,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: theme.fonts.md,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: theme.fonts.xxl,
    fontWeight: 'bold',
  },
  elderButton: {
    marginTop: 24,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: theme.borderRadius.lg,
  },
  elderButtonText: {
    color: theme.colors.warning,
    fontSize: theme.fonts.xl,
    fontWeight: '600',
  },
});

export default LoginScreen;
