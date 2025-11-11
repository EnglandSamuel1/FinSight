/**
 * Database types for Supabase
 * 
 * This file will be populated with generated types from Supabase schema.
 * To generate types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Run: supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 * 
 * Or manually define types matching the schema in docs/architecture.md
 */

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
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          amount_cents: number
          merchant: string
          description: string | null
          category_id: string | null
          is_duplicate: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          amount_cents: number
          merchant: string
          description?: string | null
          category_id?: string | null
          is_duplicate?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount_cents?: number
          merchant?: string
          description?: string | null
          category_id?: string | null
          is_duplicate?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          month: string
          amount_cents: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          month: string
          amount_cents: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          month?: string
          amount_cents?: number
          created_at?: string
          updated_at?: string
        }
      }
      categorization_rules: {
        Row: {
          id: string
          user_id: string
          merchant_pattern: string
          category_id: string
          confidence: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          merchant_pattern: string
          category_id: string
          confidence?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          merchant_pattern?: string
          category_id?: string
          confidence?: number
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          content?: string
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
