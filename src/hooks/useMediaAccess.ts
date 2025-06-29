import { useCallback, useEffect, useRef, useState } from 'react';

interface MediaAccessState {
  hasVideoPermission: boolean;
  hasAudioPermission: boolean;
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  isRequestingPermissions: boolean;
  error: string | null;
  isRecording: boolean;
  recordedChunks: Blob[];
}

interface UseMediaAccessReturn extends MediaAccessState {
  requestPermissions: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => Blob | null;
  toggleVideo: () => void;
  toggleAudio: () => void;
  cleanup: () => void;
}

export const useMediaAccess = (): UseMediaAccessReturn => {
  const [state, setState] = useState<MediaAccessState>({
    hasVideoPermission: false,
    hasAudioPermission: false,
    videoStream: null,
    audioStream: null,
    isRequestingPermissions: false,
    error: null,
    isRecording: false,
    recordedChunks: []
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const requestPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, isRequestingPermissions: true, error: null }));

    try {
      console.log('Requesting media permissions...');
      
      // For React Native, we'll need to use different APIs
      // This is a placeholder implementation that matches the web version
      // In actual React Native, you'd use libraries like react-native-camera or expo-camera
      
      // Mock implementation for now - in real RN app, use expo-camera/expo-av
      const mockStream = {
        getVideoTracks: () => [{ enabled: true }],
        getAudioTracks: () => [{ enabled: true }]
      } as any;

      console.log('Media permissions granted (mock)');

      setState(prev => ({
        ...prev,
        hasVideoPermission: true,
        hasAudioPermission: true,
        videoStream: mockStream,
        audioStream: mockStream,
        isRequestingPermissions: false
      }));

    } catch (error) {
      console.error('Error requesting media permissions:', error);
      
      let errorMessage = 'Failed to access camera and microphone';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera and microphone access denied. Please allow permissions and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera and microphone access not supported in this browser.';
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRequestingPermissions: false
      }));
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!state.audioStream) {
      console.warn('No audio stream available for recording');
      return;
    }

    try {
      console.log('Starting audio recording...');
      chunksRef.current = [];
      
      // Mock implementation - in real RN app, use expo-av
      setState(prev => ({ ...prev, isRecording: true }));

    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start recording'
      }));
    }
  }, [state.audioStream]);

  const stopRecording = useCallback((): Blob | null => {
    if (state.isRecording) {
      console.log('Stopping recording...');
      setState(prev => ({ ...prev, isRecording: false }));
      
      // Mock implementation - return null for now
      return null;
    }
    return null;
  }, [state.isRecording]);

  const toggleVideo = useCallback(() => {
    if (state.videoStream) {
      const newEnabled = !state.hasVideoPermission;
      setState(prev => ({
        ...prev,
        hasVideoPermission: newEnabled
      }));
      
      console.log('Video toggled:', newEnabled ? 'ON' : 'OFF');
    }
  }, [state.videoStream, state.hasVideoPermission]);

  const toggleAudio = useCallback(() => {
    if (state.audioStream) {
      const newEnabled = !state.hasAudioPermission;
      setState(prev => ({
        ...prev,
        hasAudioPermission: newEnabled
      }));
      
      console.log('Audio toggled:', newEnabled ? 'ON' : 'OFF');
    }
  }, [state.audioStream, state.hasAudioPermission]);

  const cleanup = useCallback(() => {
    console.log('Cleaning up media streams...');
    
    if (state.isRecording) {
      stopRecording();
    }

    setState(prev => ({
      ...prev,
      videoStream: null,
      audioStream: null,
      hasVideoPermission: false,
      hasAudioPermission: false,
      isRecording: false,
      recordedChunks: []
    }));
  }, [state.isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    requestPermissions,
    startRecording,
    stopRecording,
    toggleVideo,
    toggleAudio,
    cleanup
  };
}; 