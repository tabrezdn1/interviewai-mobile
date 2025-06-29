export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          subscription_tier: string | null
          conversation_minutes_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          conversation_minutes_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          conversation_minutes_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          interview_type_id: string
          experience_level_id: string
          difficulty_level_id: string
          job_position: string
          company_name: string | null
          job_description: string | null
          additional_context: string | null
          status: string
          tavus_conversation_id: string | null
          tavus_conversation_url: string | null
          daily_room_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interview_type_id: string
          experience_level_id: string
          difficulty_level_id: string
          job_position: string
          company_name?: string | null
          job_description?: string | null
          additional_context?: string | null
          status?: string
          tavus_conversation_id?: string | null
          tavus_conversation_url?: string | null
          daily_room_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interview_type_id?: string
          experience_level_id?: string
          difficulty_level_id?: string
          job_position?: string
          company_name?: string | null
          job_description?: string | null
          additional_context?: string | null
          status?: string
          tavus_conversation_id?: string | null
          tavus_conversation_url?: string | null
          daily_room_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          interview_id: string
          overall_score: number
          summary: string
          strengths: Json
          improvements: Json
          skill_scores: Json
          transcript: string | null
          tavus_analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          interview_id: string
          overall_score: number
          summary: string
          strengths: Json
          improvements: Json
          skill_scores: Json
          transcript?: string | null
          tavus_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          interview_id?: string
          overall_score?: number
          summary?: string
          strengths?: Json
          improvements?: Json
          skill_scores?: Json
          transcript?: string | null
          tavus_analysis?: Json | null
          created_at?: string
        }
      }
      interview_types: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      experience_levels: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      difficulty_levels: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 