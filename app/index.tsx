import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { user, loading, isAuthenticated } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
