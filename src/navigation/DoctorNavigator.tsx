import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationsApi } from '../api';
import { DoctorDashboard, ScheduleScreen } from '../screens/doctor';
import {
    MessagesScreen,
    ChatScreen,
    NotificationsScreen,
    ProfileScreen,
} from '../screens/shared';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DoctorTabNavigator() {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { count } = await notificationsApi.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                // Silently fail - badge is optional
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBackground,
                    borderTopColor: colors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Schedule':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'Messages':
                            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                            break;
                        case 'Notifications':
                            iconName = focused ? 'notifications' : 'notifications-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DoctorDashboard}
                options={{ tabBarLabel: t('nav.dashboard') }}
            />
            <Tab.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ tabBarLabel: t('nav.schedule') }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{ tabBarLabel: t('nav.messages') }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarLabel: t('nav.notifications'),
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarBadgeStyle: { backgroundColor: colors.error },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: t('nav.profile') }}
            />
        </Tab.Navigator>
    );
}

export function DoctorNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DoctorTabs" component={DoctorTabNavigator} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}
