import { supabase } from '../config/supabase';

// Date formatting utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

// Status formatting
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'scheduled':
      return '#3B82F6';
    case 'in_progress':
      return '#F59E0B';
    case 'canceled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'scheduled':
      return 'Scheduled';
    case 'in_progress':
      return 'In Progress';
    case 'canceled':
      return 'Canceled';
    default:
      return 'Unknown';
  }
};

// Score formatting
export const formatScore = (score: number | null | undefined): string => {
  if (score === null || score === undefined) {
    return 'N/A';
  }
  return `${Math.round(score)}/100`;
};

export const getScoreColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) {
    return '#6B7280';
  }
  
  if (score >= 80) {
    return '#10B981'; // Green
  } else if (score >= 60) {
    return '#F59E0B'; // Yellow
  } else {
    return '#EF4444'; // Red
  }
};

export const getScoreRating = (score: number): string => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Satisfactory";
  return "Needs Improvement";
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Text truncation
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Interview type helpers
export const getInterviewTypeColor = (type: string): string => {
  switch (type) {
    case 'technical':
      return '#3B82F6';
    case 'behavioral':
      return '#10B981';
    case 'mixed':
      return '#8B5CF6';
    case 'screening':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

// Time helpers
export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'morning';
  } else if (hour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

export const formatTimeRemaining = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diffInMs = end.getTime() - now.getTime();
  
  if (diffInMs <= 0) {
    return 'Expired';
  }
  
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} left`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} left`;
  } else {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} left`;
  }
};

// Error handling
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'An unexpected error occurred';
};

// Platform helpers
export const isWeb = (): boolean => {
  return typeof window !== 'undefined';
};

export const isMobile = (): boolean => {
  return !isWeb();
};

// Gravatar URL generation
export function generateGravatarUrl(email: string): string {
  // Simple hash function for React Native (crypto not available)
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const hashStr = Math.abs(hash).toString(16);
  return `https://www.gravatar.com/avatar/${hashStr}?d=identicon&s=200`;
}

// Random utilities
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Dynamic data fetching functions
export async function fetchInterviewTypes() {
  try {
    const { data, error } = await supabase
      .from('interview_types')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching interview types:', error);
    // Fall back to the static data matching the original web app (only 3 types)
    return [
      {
        type: "technical",
        title: "Technical",
        description: "Coding, system design, and technical knowledge questions",
        icon: "Code",
      },
      {
        type: "behavioral", 
        title: "Behavioral",
        description: "Questions about your past experiences and situations",
        icon: "User",
      },
      {
        type: "mixed",
        title: "Mixed",
        description: "Combination of technical and behavioral questions",
        icon: "Briefcase",
      },
    ];
  }
}

export async function fetchExperienceLevels() {
  try {
    const { data, error } = await supabase
      .from('experience_levels')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching experience levels:', error);
    // Fall back to the static data
    return [
      { value: "entry", label: "Entry Level (0-2 years)" },
      { value: "mid", label: "Mid Level (3-5 years)" },
      { value: "senior", label: "Senior Level (6+ years)" },
    ];
  }
}

export async function fetchDifficultyLevels() {
  try {
    const { data, error } = await supabase
      .from('difficulty_levels')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching difficulty levels:', error);
    // Fall back to the static data
    return [
      { value: "easy", label: "Easy - Beginner friendly questions" },
      { value: "medium", label: "Medium - Standard interview difficulty" },
      { value: "hard", label: "Hard - Challenging interview questions" },
    ];
  }
}

// Get conversation minutes for a user
export async function getConversationMinutes(userId: string): Promise<{total: number, used: number, remaining: number} | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_conversation_minutes, used_conversation_minutes')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      total: data.total_conversation_minutes || 0,
      used: data.used_conversation_minutes || 0,
      remaining: (data.total_conversation_minutes || 0) - (data.used_conversation_minutes || 0)
    };
  } catch (error) {
    console.error('Error fetching conversation minutes:', error);
    return null;
  }
}

export async function fetchUserInterviews(userId: string) {
  try {
    // Check if userId is a valid UUID before making Supabase query
    if (!isValidUUID(userId)) {
      console.warn(`Invalid UUID format for user ID: ${userId}, returning empty array`);
      return [];
    }

    console.log('🔍 fetchUserInterviews: Fetching interviews for user', userId);
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        interview_types (type, title),
        experience_levels (value, label),
        difficulty_levels (value, label)
      `)
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: false });
    
    if (error) throw error;
    console.log('🔍 fetchUserInterviews: Fetched', data?.length || 0, 'interviews');
    return data || [];
  } catch (error) {
    console.error('Error fetching interviews:', error);
    console.log('🔍 fetchUserInterviews: Error, returning empty array');
    return [];
  }
}

export async function fetchInterviewFeedback(interviewId: string) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('interview_id', interviewId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching interview feedback:', error);
    return null;
  }
}

// Utility function to check if a string is a valid UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 