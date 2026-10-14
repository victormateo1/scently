export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      perfume_history: {
        Row: {
          created_at: string
          diff_ml: number | null
          id: string
          kind: string
          new_ml: number
          note: string | null
          perfume_id: string
          previous_ml: number
          size_ml_at_time: number
          user_id: string
        }
        Insert: {
          created_at?: string
          diff_ml?: number | null
          id?: string
          kind?: string
          new_ml: number
          note?: string | null
          perfume_id: string
          previous_ml: number
          size_ml_at_time: number
          user_id?: string
        }
        Update: {
          created_at?: string
          diff_ml?: number | null
          id?: string
          kind?: string
          new_ml?: number
          note?: string | null
          perfume_id?: string
          previous_ml?: number
          size_ml_at_time?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfume_history_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfumes: {
        Row: {
          base_notes: string[]
          brand: string
          climate: string[]
          concentration: string
          created_at: string
          daytime: string | null
          family: string | null
          finished_at: string | null
          formality: string | null
          heart_notes: string[]
          id: string
          intensity: number | null
          is_favorite: boolean
          longevity_hours: number | null
          name: string
          notes: string | null
          occasions: string[]
          photo_path: string | null
          price: number | null
          purchase_date: string | null
          rating: number | null
          remaining_ml: number
          seasons: string[]
          sillage: string | null
          size_ml: number
          spray_ml: number
          status: string
          store: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
          versatility: number | null
        }
        Insert: {
          base_notes?: string[]
          brand: string
          climate?: string[]
          concentration?: string
          created_at?: string
          daytime?: string | null
          family?: string | null
          finished_at?: string | null
          formality?: string | null
          heart_notes?: string[]
          id?: string
          intensity?: number | null
          is_favorite?: boolean
          longevity_hours?: number | null
          name: string
          notes?: string | null
          occasions?: string[]
          photo_path?: string | null
          price?: number | null
          purchase_date?: string | null
          rating?: number | null
          remaining_ml: number
          seasons?: string[]
          sillage?: string | null
          size_ml: number
          spray_ml?: number
          status?: string
          store?: string | null
          top_notes?: string[]
          updated_at?: string
          user_id?: string
          versatility?: number | null
        }
        Update: {
          base_notes?: string[]
          brand?: string
          climate?: string[]
          concentration?: string
          created_at?: string
          daytime?: string | null
          family?: string | null
          finished_at?: string | null
          formality?: string | null
          heart_notes?: string[]
          id?: string
          intensity?: number | null
          is_favorite?: boolean
          longevity_hours?: number | null
          name?: string
          notes?: string | null
          occasions?: string[]
          photo_path?: string | null
          price?: number | null
          purchase_date?: string | null
          rating?: number | null
          remaining_ml?: number
          seasons?: string[]
          sillage?: string | null
          size_ml?: number
          spray_ml?: number
          status?: string
          store?: string | null
          top_notes?: string[]
          updated_at?: string
          user_id?: string
          versatility?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          default_view: string
          display_name: string | null
          id: string
          low_threshold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_view?: string
          display_name?: string | null
          id: string
          low_threshold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_view?: string
          display_name?: string | null
          id?: string
          low_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          brand: string
          created_at: string
          id: string
          is_initial: boolean
          notes: string | null
          perfume_id: string | null
          perfume_name: string
          price: number | null
          purchase_date: string | null
          size_ml: number | null
          store: string | null
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          is_initial?: boolean
          notes?: string | null
          perfume_id?: string | null
          perfume_name: string
          price?: number | null
          purchase_date?: string | null
          size_ml?: number | null
          store?: string | null
          user_id?: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          is_initial?: boolean
          notes?: string | null
          perfume_id?: string | null
          perfume_name?: string
          price?: number | null
          purchase_date?: string | null
          size_ml?: number | null
          store?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_perfume_id_fkey"
            columns: ["perfume_id"]
            isOneToOne: false
            referencedRelation: "perfumes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      register_sprays: {
        Args: { _count: number; _perfume_id: string }
        Returns: number
      }
      update_remaining: {
        Args: { _ml: number; _note?: string; _perfume_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
