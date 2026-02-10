import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          color?: string;
          icon?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          type: 'dialogue' | 'video' | 'text';
          content: any | null;
          video_url: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          type: 'dialogue' | 'video' | 'text';
          content?: any | null;
          video_url?: string | null;
          order_index: number;
        };
        Update: {
          title?: string;
          type?: 'dialogue' | 'video' | 'text';
          content?: any | null;
          video_url?: string | null;
          order_index?: number;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          lesson_id: string;
          text: string;
          options: string[];
          correct_index: number;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          text: string;
          options: string[];
          correct_index: number;
          order_index: number;
        };
        Update: {
          text?: string;
          options?: string[];
          correct_index?: number;
          order_index?: number;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          lesson_id: string;
          type: 'word-order' | 'memory' | 'matching';
          title: string;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: 'word-order' | 'memory' | 'matching';
          title: string;
          data: any;
        };
        Update: {
          title?: string;
          data?: any;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          quiz_score: number | null;
          game_scores: any[];
          started_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          quiz_score?: number | null;
          game_scores?: any[];
        };
        Update: {
          completed?: boolean;
          quiz_score?: number | null;
          game_scores?: any[];
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          language: string;
          notifications_enabled: boolean;
          dark_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language?: string;
          notifications_enabled?: boolean;
          dark_mode?: boolean;
        };
        Update: {
          language?: string;
          notifications_enabled?: boolean;
          dark_mode?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};
