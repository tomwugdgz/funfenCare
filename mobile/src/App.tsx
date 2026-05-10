/**
 * App 主入口
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

// 监护人端页面
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

// 独居用户端页面
import ElderHomeScreen from './screens/ElderHomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 监护人端 Tab 导航
const GuardianTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 14,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: '#2196F3',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
    }}
  >
    <Tab.Screen
      name="首页"
      component={HomeScreen}
      options={{ tabBarLabel: '首页', tabBarIcon: () => <Text>🏠</Text> }}
    />
    <Tab.Screen
      name="监控"
      component={HomeScreen}
      options={{ tabBarLabel: '监控', tabBarIcon: () => <Text>📡</Text> }}
    />
    <Tab.Screen
      name="服务"
      component={HomeScreen}
      options={{ tabBarLabel: '服务', tabBarIcon: () => <Text>📋</Text> }}
    />
    <Tab.Screen
      name="我的"
      component={HomeScreen}
      options={{ tabBarLabel: '我的', tabBarIcon: () => <Text>👤</Text> }}
    />
  </Tab.Navigator>
);

// 独居用户端 Tab 导航（适老化：仅3个Tab）
const ElderTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        height: 72,
        paddingBottom: 12,
        paddingTop: 12,
      },
      tabBarLabelStyle: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#999',
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="首页"
      component={ElderHomeScreen}
      options={{ tabBarLabel: '首页', tabBarIcon: () => <Text style={{ fontSize: 28 }}>🏠</Text> }}
    />
    <Tab.Screen
      name="聊天"
      component={HomeScreen}
      options={{ tabBarLabel: '聊天', tabBarIcon: () => <Text style={{ fontSize: 28 }}>💬</Text> }}
    />
    <Tab.Screen
      name="我的"
      component={HomeScreen}
      options={{ tabBarLabel: '我的', tabBarIcon: () => <Text style={{ fontSize: 28 }}>👤</Text> }}
    />
  </Tab.Navigator>
);

// 主导航
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeTabs" component={GuardianTabs} />
        <Stack.Screen name="ElderHome" component={ElderTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
