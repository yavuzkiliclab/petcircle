import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/theme';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border2,
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text3,
        tabBarShowLabel: false,
        headerStyle: { backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border2 },
        headerTitleStyle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
        headerTintColor: COLORS.primary,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          title: '▶ Reels',
          headerStyle: { backgroundColor: '#000' },
          headerTitleStyle: { color: '#fff', fontSize: 16, fontWeight: '700' },
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 46, height: 32, borderRadius: 10,
              backgroundColor: focused ? COLORS.primary : COLORS.bg2,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="play" size={20} color={focused ? '#fff' : COLORS.text3} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const FeedStack = () => (
  <Stack.Navigator screenOptions={headerOpts}>
    <Stack.Screen name="FeedMain" component={FeedScreen} options={{ title: '🐾 PetCircle' }} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Gönderi' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={({ route }) => ({ title: route.params?.username })} />
  </Stack.Navigator>
);

const ExploreStack = () => (
  <Stack.Navigator screenOptions={headerOpts}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} options={{ title: 'Keşfet' }} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Gönderi' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={({ route }) => ({ title: route.params?.username })} />
  </Stack.Navigator>
);

const ProfileStack = () => {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={headerOpts}>
      <Stack.Screen
        name="MyProfile"
        component={ProfileScreen}
        options={{ title: user?.username || 'Profil' }}
        initialParams={{ username: user?.username }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Gönderi' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={({ route }) => ({ title: route.params?.username })} />
    </Stack.Navigator>
  );
};

const headerOpts = {
  headerStyle: { backgroundColor: COLORS.card },
  headerTitleStyle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  headerTintColor: COLORS.primary,
  headerBackTitleVisible: false,
};

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
