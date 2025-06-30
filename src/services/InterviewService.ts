import { supabase } from '../config/supabase';
import { getConversationMinutes, updateConversationMinutes } from './ProfileService';

export interface InterviewFormData {
  interviewType: string;
  role: string;
  company?: string;
  experience: string;
  difficulty: string;
  duration: number;
  scheduled_at?: string;
  interviewMode?: string;
  selectedRounds?: string[];
  roundDurations?: Record<string, number>;
}

// Use the same interface as the web app
export interface Interview {
  id: string;
  title: string;
  company: string | null;
  role: string;
  scheduled_at: string;
  status: string;
  score?: number | null;
  duration?: number;
  prompt_status?: string;
  prompt_error?: string;
  feedback_processing_status?: string;
  tavus_conversation_id?: string | null;
  experience_levels?: {
    label: string;
  };
  difficulty_levels?: {
    label: string;
  };
  interview_types?: {
    type: string;
    title: string;
  };
  completed_at?: string;
  created_at?: string;
}

// Helper function to check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(url && 
           key && 
           url !== 'your-supabase-url' && 
           url.startsWith('http') &&
           key !== 'your-supabase-anon-key');
}

export async function createInterview(userId: string, formData: InterviewFormData) {
  try {
    console.log('Creating interview with form data:', formData);

    // Check user's conversation minutes before creating interview
    const conversationMinutes = await getConversationMinutes(userId);
    
    if (!conversationMinutes) {
      throw new Error('Unable to fetch user conversation minutes');
    }
    
    if (conversationMinutes.remaining < formData.duration) {
      throw new Error(`Insufficient conversation minutes. You have ${conversationMinutes.remaining} minutes remaining, but need ${formData.duration} minutes for this interview. Please upgrade your plan to continue.`);
    }

    // Validate required fields
    if (!formData.interviewType || formData.interviewType.trim() === '') {
      throw new Error('Interview type is required');
    }
    
    if (!formData.role || formData.role.trim() === '') {
      throw new Error('Job role is required');
    }
    
    if (!formData.company || formData.company.trim() === '') {
      throw new Error('Company is required');
    }
    
    if (!formData.experience || formData.experience.trim() === '') {
      throw new Error('Experience level is required');
    }
    
    if (!formData.difficulty || formData.difficulty.trim() === '') {
      throw new Error('Difficulty level is required');
    }

    // Get the IDs for the selected types
    const { data: interviewTypeData, error: typeError } = await supabase
      .from('interview_types')
      .select('id')
      .eq('type', formData.interviewType)
      .single();
    
    if (typeError) {
      console.error('Error fetching interview type:', typeError);
      throw new Error(`Interview type "${formData.interviewType}" not found in database`);
    }
    
    const { data: experienceLevelData, error: expError } = await supabase
      .from('experience_levels')
      .select('id')
      .eq('value', formData.experience)
      .single();
    
    // Experience is optional
    const experienceLevelId = expError ? null : experienceLevelData?.id;
    
    const { data: difficultyLevelData, error: diffError } = await supabase
      .from('difficulty_levels')
      .select('id')
      .eq('value', formData.difficulty)
      .single();
    
    if (diffError) {
      console.error('Error fetching difficulty level:', diffError);
      throw new Error(`Difficulty level "${formData.difficulty}" not found in database`);
    }
    
    const interviewData = {
      user_id: userId,
      title: formData.interviewMode === 'complete' 
        ? `Complete ${formData.role} Interview` 
        : `${formData.role} ${formData.interviewType} Interview`,
      company: formData.company || null,
      role: formData.role,
      interview_type_id: interviewTypeData.id,
      experience_level_id: experienceLevelId,
      difficulty_level_id: difficultyLevelData.id,
      status: 'scheduled',
      scheduled_at: formData.scheduled_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: formData.duration,
      prompt_status: 'pending'
    };
    
    console.log('Inserting interview data:', interviewData);
    
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert([interviewData])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting interview:', error);
      throw error;
    }
    
    console.log('Successfully created interview:', interview);
    
    // Reserve the minutes for this interview
    const minutesReserved = await updateConversationMinutes(userId, formData.duration);
    if (!minutesReserved) {
      console.warn('Failed to reserve conversation minutes, but interview was created');
    }
    
    // Trigger prompt generation asynchronously
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
        
      const userName = profile?.name || 'Candidate';
      
      const { error: rpcError } = await supabase.rpc('trigger_prompt_generation', {
        p_interview_id: interview.id,
        p_interview_type: formData.interviewType,
        p_role: formData.role,
        p_company: formData.company || '',
        p_experience_level: formData.experience,
        p_difficulty_level: formData.difficulty,
        p_user_name: userName
      });
      
      if (rpcError) {
        console.error('Error triggering prompt generation:', rpcError);
      } else {
        console.log('Prompt generation triggered successfully');
      }
    } catch (promptError) {
      console.error('Error in prompt generation process:', promptError);
    }
    
    return interview;
  } catch (error) {
    console.error('Error creating interview:', error);
    throw error;
  }
}

export async function getInterviews(userId: string) {
  try {
    console.log('🎯 InterviewService.getInterviews: Fetching interviews for user', userId);
    
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        interview_types(type, title),
        experience_levels(value, label),
        difficulty_levels(value, label)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('🎯 InterviewService.getInterviews: Fetched', data?.length || 0, 'interviews');
    return data || [];
  } catch (error) {
    console.error('Error fetching interviews:', error);
    console.log('🎯 InterviewService.getInterviews: Error, returning empty array');
    return [];
  }
}

export async function getInterview(id: string) {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        interview_types(type, title),
        experience_levels(value, label),
        difficulty_levels(value, label)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching interview:', error);
    throw error;
  }
}

export async function deleteInterview(id: string) {
  try {
    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
}

export async function cancelInterview(id: string) {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error cancelling interview:', error);
    throw error;
  }
}

export async function updateInterview(id: string, formDataOrUpdates: InterviewFormData | Partial<{
  title: string;
  company: string | null;
  scheduled_at: string;
  role: string;
}>) {
  try {
    let updateData: any;
    
    // Check if it's form data (has interviewType property) or direct updates
    if ('interviewType' in formDataOrUpdates) {
      const formData = formDataOrUpdates as InterviewFormData;
      
      // Validate required fields
      if (!formData.interviewType || formData.interviewType.trim() === '') {
        throw new Error('Interview type is required');
      }
      
      if (!formData.role || formData.role.trim() === '') {
        throw new Error('Job role is required');
      }
      
      if (!formData.company || formData.company.trim() === '') {
        throw new Error('Company is required');
      }
      
      if (!formData.experience || formData.experience.trim() === '') {
        throw new Error('Experience level is required');
      }
      
      if (!formData.difficulty || formData.difficulty.trim() === '') {
        throw new Error('Difficulty level is required');
      }

      // Get the IDs for the selected types
      const { data: interviewTypeData, error: typeError } = await supabase
        .from('interview_types')
        .select('id')
        .eq('type', formData.interviewType)
        .single();
      
      if (typeError) {
        console.error('Error fetching interview type:', typeError);
        throw new Error(`Interview type "${formData.interviewType}" not found in database`);
      }
      
      const { data: experienceLevelData, error: expError } = await supabase
        .from('experience_levels')
        .select('id')
        .eq('value', formData.experience)
        .single();
      
      // Experience is optional
      const experienceLevelId = expError ? null : experienceLevelData?.id;
      
      const { data: difficultyLevelData, error: diffError } = await supabase
        .from('difficulty_levels')
        .select('id')
        .eq('value', formData.difficulty)
        .single();
      
      if (diffError) {
        console.error('Error fetching difficulty level:', diffError);
        throw new Error(`Difficulty level "${formData.difficulty}" not found in database`);
      }
      
      updateData = {
        title: `${formData.role} ${formData.interviewType} Interview`,
        company: formData.company || null,
        role: formData.role,
        interview_type_id: interviewTypeData.id,
        experience_level_id: experienceLevelId,
        difficulty_level_id: difficultyLevelData.id,
        duration: formData.duration,
        updated_at: new Date().toISOString()
      };
    } else {
      // Direct updates (backward compatibility)
      updateData = formDataOrUpdates;
    }
    
    const { data, error } = await supabase
      .from('interviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating interview:', error);
    throw error;
  }
}

export async function retryPromptGeneration(interviewId: string, userName: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('retry_prompt_generation', {
      p_interview_id: interviewId,
      p_user_name: userName
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error retrying prompt generation:', error);
    return false;
  }
}

export async function startFeedbackProcessing(interviewId: string, tavusConversationId: string) {
  try {
    const { error } = await supabase.rpc('start_feedback_processing', {
      p_interview_id: interviewId,
      p_tavus_conversation_id: tavusConversationId
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error starting feedback processing:', error);
    return false;
  }
}

// Export default service object
export const InterviewService = {
  createInterview,
  getInterviews,
  getInterview,
  deleteInterview,
  cancelInterview,
  updateInterview,
  retryPromptGeneration,
  startFeedbackProcessing
}; 