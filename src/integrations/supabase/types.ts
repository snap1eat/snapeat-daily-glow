export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      food_items: {
        Row: {
          barcode: string | null
          calories: number
          carbs: number
          created_at: string | null
          default_portion: number
          fats: number
          fiber: number | null
          id: string
          name: string
          protein: number
          saturated_fats: number | null
          sodium: number | null
          sugar: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          calories: number
          carbs: number
          created_at?: string | null
          default_portion: number
          fats: number
          fiber?: number | null
          id?: string
          name: string
          protein: number
          saturated_fats?: number | null
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          calories?: number
          carbs?: number
          created_at?: string | null
          default_portion?: number
          fats?: number
          fiber?: number | null
          id?: string
          name?: string
          protein?: number
          saturated_fats?: number | null
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      habits: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      health_conditions: {
        Row: {
          id: string
          name: string
          type: string | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          cantidad: number
          created_at: string | null
          date: string | null
          foods: Json
          id: string
          image_url: string | null
          input_method: string | null
          meal_type: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fiber: number | null
          total_protein: number
          total_sodium: number | null
          total_sugar: number | null
          user_id: string
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          date?: string | null
          foods?: Json
          id?: string
          image_url?: string | null
          input_method?: string | null
          meal_type: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fiber?: number | null
          total_protein: number
          total_sodium?: number | null
          total_sugar?: number | null
          user_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          date?: string | null
          foods?: Json
          id?: string
          image_url?: string | null
          input_method?: string | null
          meal_type?: string
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          message: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          gender: string | null
          has_crown: boolean | null
          height: number | null
          id: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          gender?: string | null
          has_crown?: boolean | null
          height?: number | null
          id: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          gender?: string | null
          has_crown?: boolean | null
          height?: number | null
          id?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          calories: number
          carbs: number
          fat: number
          id: string
          nutrition_goal: string | null
          protein: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          fat?: number
          id?: string
          nutrition_goal?: string | null
          protein?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          fat?: number
          id?: string
          nutrition_goal?: string | null
          protein?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_habits: {
        Row: {
          alcohol_consumption: string | null
          caffeine: string | null
          diet_quality: number | null
          diet_type: string | null
          favorite_food: string | null
          id: string
          sleep_hours: number | null
          sugar_intake: string | null
          tobacco: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alcohol_consumption?: string | null
          caffeine?: string | null
          diet_quality?: number | null
          diet_type?: string | null
          favorite_food?: string | null
          id?: string
          sleep_hours?: number | null
          sugar_intake?: string | null
          tobacco?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alcohol_consumption?: string | null
          caffeine?: string | null
          diet_quality?: number | null
          diet_type?: string | null
          favorite_food?: string | null
          id?: string
          sleep_hours?: number | null
          sugar_intake?: string | null
          tobacco?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_health: {
        Row: {
          additional_health_info: string | null
          cholesterol: string | null
          digestive_issues: string | null
          family_diabetes: boolean | null
          family_hypertension: boolean | null
          food_intolerances: string | null
          glycemia: string | null
          hypertension: boolean | null
          id: string
          triglycerides: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_health_info?: string | null
          cholesterol?: string | null
          digestive_issues?: string | null
          family_diabetes?: boolean | null
          family_hypertension?: boolean | null
          food_intolerances?: string | null
          glycemia?: string | null
          hypertension?: boolean | null
          id?: string
          triglycerides?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_health_info?: string | null
          cholesterol?: string | null
          digestive_issues?: string | null
          family_diabetes?: boolean | null
          family_hypertension?: boolean | null
          food_intolerances?: string | null
          glycemia?: string | null
          hypertension?: boolean | null
          id?: string
          triglycerides?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          animations: boolean | null
          audio_exercises: boolean | null
          created_at: string | null
          id: string
          motivation_messages: boolean | null
          notification_news: boolean | null
          notification_reminders: boolean | null
          reminder_times: Json | null
          sound_effects: boolean | null
          updated_at: string | null
          vibration: boolean | null
        }
        Insert: {
          animations?: boolean | null
          audio_exercises?: boolean | null
          created_at?: string | null
          id: string
          motivation_messages?: boolean | null
          notification_news?: boolean | null
          notification_reminders?: boolean | null
          reminder_times?: Json | null
          sound_effects?: boolean | null
          updated_at?: string | null
          vibration?: boolean | null
        }
        Update: {
          animations?: boolean | null
          audio_exercises?: boolean | null
          created_at?: string | null
          id?: string
          motivation_messages?: boolean | null
          notification_news?: boolean | null
          notification_reminders?: boolean | null
          reminder_times?: Json | null
          sound_effects?: boolean | null
          updated_at?: string | null
          vibration?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          created_at: string | null
          date: string
          glasses: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          glasses?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          glasses?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
