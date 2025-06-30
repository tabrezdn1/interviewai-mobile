import { Redirect } from 'expo-router';
import { LoadingComponent } from '../src/components';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { user, loading, isAuthenticated } = useAuthStore();

  if (loading) {
    return (
      <LoadingComponent 
        message="Loading..."
        size="large"
      />
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
