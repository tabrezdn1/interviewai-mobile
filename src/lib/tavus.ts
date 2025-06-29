interface TavusConversationRequest {
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  properties?: {
    max_call_duration?: number;
    enable_recording?: boolean;
    enable_transcription?: boolean;
    apply_greenscreen?: boolean;
    conversational_context?: string;
    custom_greeting?: string;
  };
}

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
  created_at: string;
}

// Tavus configuration for different interview types
const TAVUS_CONFIG = {
  technical: {
    replicaId: process.env.EXPO_PUBLIC_TAVUS_TECHNICAL_REPLICA_ID || '',
    personaId: process.env.EXPO_PUBLIC_TAVUS_TECHNICAL_PERSONA_ID || ''
  },
  behavioral: {
    replicaId: process.env.EXPO_PUBLIC_TAVUS_BEHAVIORAL_REPLICA_ID || '',
    personaId: process.env.EXPO_PUBLIC_TAVUS_BEHAVIORAL_PERSONA_ID || ''
  },
  mixed: {
    replicaId: process.env.EXPO_PUBLIC_TAVUS_MIXED_REPLICA_ID || '',
    personaId: process.env.EXPO_PUBLIC_TAVUS_MIXED_PERSONA_ID || ''
  },
  screening: {
    replicaId: process.env.EXPO_PUBLIC_TAVUS_SCREENING_REPLICA_ID || '',
    personaId: process.env.EXPO_PUBLIC_TAVUS_SCREENING_PERSONA_ID || ''
  }
};

export const isTavusConfigured = (): boolean => {
  const apiKey = process.env.EXPO_PUBLIC_TAVUS_API_KEY;
  return !!apiKey;
};

export const getReplicaForInterviewType = (interviewType: string) => {
  const config = TAVUS_CONFIG[interviewType as keyof typeof TAVUS_CONFIG];
  return {
    replicaId: config?.replicaId || '',
    personaId: config?.personaId || ''
  };
};

export const createConversation = async (request: TavusConversationRequest): Promise<TavusConversation> => {
  const apiKey = process.env.EXPO_PUBLIC_TAVUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Tavus API key not configured');
  }

  try {
    console.log('Creating Tavus conversation with request:', request);
    
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Tavus API error:', response.status, errorData);
      throw new Error(`Tavus API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Tavus conversation created:', data);
    
    return data;
  } catch (error) {
    console.error('Error creating Tavus conversation:', error);
    throw error;
  }
};

export const endConversation = async (conversationId: string): Promise<void> => {
  const apiKey = process.env.EXPO_PUBLIC_TAVUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Tavus API key not configured');
  }

  try {
    console.log('Ending Tavus conversation:', conversationId);
    
    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Tavus API error:', response.status, errorData);
      throw new Error(`Tavus API error: ${response.status} ${errorData}`);
    }

    console.log('Tavus conversation ended successfully');
  } catch (error) {
    console.error('Error ending Tavus conversation:', error);
    throw error;
  }
};

export const getConversationStatus = async (conversationId: string): Promise<any> => {
  const apiKey = process.env.EXPO_PUBLIC_TAVUS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Tavus API key not configured');
  }

  try {
    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Tavus API error:', response.status, errorData);
      throw new Error(`Tavus API error: ${response.status} ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting conversation status:', error);
    throw error;
  }
}; 