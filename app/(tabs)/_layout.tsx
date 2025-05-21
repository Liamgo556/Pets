import React from 'react';
import { Tabs, useNavigationContainerRef } from 'expo-router';
import { Home, Search, Heart, Bell, UserCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Platform, View } from 'react-native';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        tabBarStyle: {
          flexDirection: 'row',
          height: isWeb ? 60 : Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: isWeb ? 0 : Platform.OS === 'ios' ? 28 : 8,
          borderTopWidth: isWeb ? 0 : 1,
          borderBottomWidth: isWeb ? 1 : 0,
          borderBottomColor: isWeb ? '#E5E7EB' : 'transparent',
        },
        tabBarPosition: isWeb ? 'top' : 'bottom',
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
        },
        headerRight: () => (
          <View style={{ marginRight: 12, marginLeft: 12 }}>
            <LanguageSwitcher />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.browse'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tabs.favorites'),
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: isAdmin ? t('tabs.admin') : t('tabs.account'),
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: Platform.OS === 'web' ? null : undefined, // Hides from web tab bar
          title: t('tabs.alerts'),
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
