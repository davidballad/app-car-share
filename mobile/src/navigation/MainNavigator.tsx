import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';
import SearchScreen from '../screens/main/SearchScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import TripsScreen from '../screens/main/TripsScreen';
import DesignSystemScreen from '../screens/design/DesignSystemScreen';

export type MainTabParamList = {
  Search: undefined;
  Bookings: undefined;
  Trips: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  DesignSystem: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="DesignSystem" 
        component={DesignSystemScreen}
        options={{ 
          title: 'Sistema de Diseño',
          headerStyle: { backgroundColor: '#2E86AB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </ProfileStack.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  const { t } = useLocalization();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E86AB', // Ecuador blue
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2E86AB',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: t('navigation.search') }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{ title: t('navigation.bookings') }}
      />
      <Tab.Screen 
        name="Trips" 
        component={TripsScreen}
        options={{ title: t('navigation.trips') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;