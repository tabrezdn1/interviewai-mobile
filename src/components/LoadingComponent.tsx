import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../store/themeStore';

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
  useGradient?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Loading...',
  size = 'medium',
  showBackground = true,
  useGradient = false,
  gradientColors
}) => {
  const colors = useThemeColors();

  const sizeMap = {
    small: { width: 60, height: 60 },
    medium: { width: 120, height: 120 },
    large: { width: 180, height: 180 }
  };

  // Get gradient colors from theme or use provided ones
  const defaultGradientColors = colors.gradientBackground || (colors.background === '#f8fafc' 
    ? ['#f8fafc', '#e0f2fe', '#f3e8ff'] as const
    : ['#0f172a', '#1e293b', '#334155'] as const);

  const finalGradientColors = gradientColors || defaultGradientColors;

  const content = (
    <>
      <Video
        source={require('../../assets/images/loading.webm')}
        style={[styles.video, sizeMap[size]]}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
        isMuted
      />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </>
  );

  if (useGradient && showBackground) {
    return (
      <LinearGradient colors={finalGradientColors as any} style={styles.container}>
        {content}
      </LinearGradient>
    );
  }

  const containerStyle = [
    styles.container,
    showBackground && { backgroundColor: colors.background }
  ];

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

// Convenience component for gradient loading
export const GradientLoadingComponent: React.FC<Omit<LoadingComponentProps, 'useGradient'>> = (props) => (
  <LoadingComponent {...props} useGradient={true} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    borderRadius: 10,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 