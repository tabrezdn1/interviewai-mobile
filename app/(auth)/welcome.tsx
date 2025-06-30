import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
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
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/interviewai-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>InterviewAI</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Master interviews with AI-powered practice
            </Text>
          </View>

          {/* Features Section - Horizontal Pills */}
          <View style={styles.featuresSection}>
            <View style={styles.featuresGrid}>
              <View style={[styles.featurePill, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Ionicons name="videocam" size={16} color={colors.primary} />
                <Text style={[styles.featurePillText, { color: colors.text }]}>AI Interviews</Text>
              </View>
              
              <View style={[styles.featurePill, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Ionicons name="analytics" size={16} color={colors.success} />
                <Text style={[styles.featurePillText, { color: colors.text }]}>Real-time Feedback</Text>
              </View>
              
              <View style={[styles.featurePill, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Ionicons name="trending-up" size={16} color={colors.warning} />
                <Text style={[styles.featurePillText, { color: colors.text }]}>Progress Tracking</Text>
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
              <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => router.push('/(auth)/signin')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <View style={[styles.disclaimerBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                This mobile app helps you schedule interviews, view feedback, and manage your account. 
                Live interviews are conducted on <Text style={[styles.disclaimerLink, { color: colors.primary }]}>interviewai.us</Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Join 10,000+ professionals improving their skills
            </Text>
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: height * 0.08,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 280,
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featurePillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ctaSection: {
    gap: 16,
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    marginBottom: 16,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginHorizontal: 4,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    flex: 1,
  },
  disclaimerLink: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Welcome; 