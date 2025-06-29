import { Link, Stack } from 'expo-router';
import { Home } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.errorCode}>404</Text>
          </View>
          
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.subtitle}>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </Text>
          
          <Link href="/" style={styles.homeButton}>
            <View style={styles.homeButtonContent}>
              <Home size={20} color="white" />
              <Text style={styles.homeButtonText}>Go Home</Text>
            </View>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  errorCode: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 