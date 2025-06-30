import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColors } from '../../src/store/themeStore';

const { width, height } = Dimensions.get('window');

const Welcome = () => {
  const colors = useThemeColors();

  // Get gradient colors from theme or fallback
  const gradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  return (
    <LinearGradient
      colors={gradientColors as any}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.logoText}>🎯</Text>
              </View>
            </View>
            
            <Text style={[styles.title, { color: colors.text }]}>InterviewAI</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Master your interview skills with AI-powered practice sessions
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={[styles.feature, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="videocam" size={24} color={colors.info} />
                </View>
                <Text style={[styles.featureText, { color: colors.text }]}>AI Video Interviews</Text>
              </View>
              
              <View style={[styles.feature, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="analytics" size={24} color={colors.success} />
                </View>
                <Text style={[styles.featureText, { color: colors.text }]}>Real-time Feedback</Text>
              </View>
              
              <View style={[styles.feature, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="trending-up" size={24} color={colors.warning} />
                </View>
                <Text style={[styles.featureText, { color: colors.text }]}>Performance Tracking</Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.buttonSecondary, borderColor: colors.border }]}
              onPress={() => router.push('/(auth)/signin')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.buttonSecondaryText }]}>Sign In</Text>
            </TouchableOpacity>
            
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Join thousands of professionals improving their interview skills
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  ctaSection: {
    gap: 16,
    paddingTop: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
});

export default Welcome; 