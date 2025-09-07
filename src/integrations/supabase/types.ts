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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crush_notifications: {
        Row: {
          created_at: string
          crush_id: string
          id: string
          recipient_email: string
        }
        Insert: {
          created_at?: string
          crush_id: string
          id?: string
          recipient_email: string
        }
        Update: {
          created_at?: string
          crush_id?: string
          id?: string
          recipient_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "crush_notifications_crush_id_fkey"
            columns: ["crush_id"]
            isOneToOne: false
            referencedRelation: "crushes"
            referencedColumns: ["id"]
          },
        ]
      }
      crush_rate_limits: {
        Row: {
          created_at: string
          date_bucket: string
          email_count: number
          id: string
          last_email_sent: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_bucket?: string
          email_count?: number
          id?: string
          last_email_sent?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_bucket?: string
          email_count?: number
          id?: string
          last_email_sent?: string
          user_id?: string
        }
        Relationships: []
      }
      crushes: {
        Row: {
          created_at: string
          email_id: string | null
          email_sent: boolean
          error_message: string | null
          id: string
          recipient_email: string
          sender_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_id?: string | null
          email_sent?: boolean
          error_message?: string | null
          id?: string
          recipient_email?: string
          sender_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_id?: string | null
          email_sent?: boolean
          error_message?: string | null
          id?: string
          recipient_email?: string
          sender_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      matching_logs: {
        Row: {
          created_at: string | null
          id: string
          search_params: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          search_params?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          search_params?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_confirmed: boolean | null
          appearance_importance: string | null
          attracted_to_types: string[] | null
          auto_translation: boolean | null
          birth_date: string | null
          body_type: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          height: number | null
          height_cm: number | null
          id: string
          latitude: number | null
          location_city: string | null
          location_country: string | null
          longitude: number | null
          max_distance: string | null
          personal_definition: string[] | null
          personality_traits: string[] | null
          photo_visibility: string | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          profile_visibility: string | null
          seeking_relationship_types: string[] | null
          skin_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_confirmed?: boolean | null
          appearance_importance?: string | null
          attracted_to_types?: string[] | null
          auto_translation?: boolean | null
          birth_date?: string | null
          body_type?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          height?: number | null
          height_cm?: number | null
          id?: string
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          longitude?: number | null
          max_distance?: string | null
          personal_definition?: string[] | null
          personality_traits?: string[] | null
          photo_visibility?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_visibility?: string | null
          seeking_relationship_types?: string[] | null
          skin_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_confirmed?: boolean | null
          appearance_importance?: string | null
          attracted_to_types?: string[] | null
          auto_translation?: boolean | null
          birth_date?: string | null
          body_type?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          height?: number | null
          height_cm?: number | null
          id?: string
          latitude?: number | null
          location_city?: string | null
          location_country?: string | null
          longitude?: number | null
          max_distance?: string | null
          personal_definition?: string[] | null
          personality_traits?: string[] | null
          photo_visibility?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_visibility?: string | null
          seeking_relationship_types?: string[] | null
          skin_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          location: string | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          preferred_body_types: string[] | null
          preferred_distances: string[] | null
          preferred_genders: string[] | null
          preferred_heights: string[] | null
          preferred_personality_types: string[] | null
          preferred_skin_colors: string[] | null
          seeking_relationship_types: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_body_types?: string[] | null
          preferred_distances?: string[] | null
          preferred_genders?: string[] | null
          preferred_heights?: string[] | null
          preferred_personality_types?: string[] | null
          preferred_skin_colors?: string[] | null
          seeking_relationship_types?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_body_types?: string[] | null
          preferred_distances?: string[] | null
          preferred_genders?: string[] | null
          preferred_heights?: string[] | null
          preferred_personality_types?: string[] | null
          preferred_skin_colors?: string[] | null
          seeking_relationship_types?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_matches_by_distance: {
        Args:
          | {
              current_user_id: string
              max_distance: number
              preferred_age_max: number
              preferred_age_min: number
              preferred_genders: string[]
              user_lat: number
              user_lon: number
            }
          | {
              current_user_id: string
              max_distance: number
              preferred_age_max?: number
              preferred_age_min?: number
              preferred_genders?: string[]
              user_lat: number
              user_lon: number
            }
        Returns: {
          age: number
          body_type: string
          display_name: string
          distance_km: number
          gender: string
          height_cm: number
          latitude: number
          longitude: number
          skin_color: string
          user_id: string
        }[]
      }
      find_secure_matches_by_distance: {
        Args: {
          current_user_id: string
          max_distance: number
          preferred_age_max: number
          preferred_age_min: number
          preferred_genders: string[]
          user_lat: number
          user_lon: number
        }
        Returns: {
          age: number
          body_type: string
          display_name: string
          distance_km: number
          gender: string
          height_cm: number
          skin_color: string
          user_id: string
        }[]
      }
      get_matching_profiles: {
        Args: {
          max_distance: number
          preferred_age_max: number
          preferred_age_min: number
          preferred_genders: string[]
          user_lat: number
          user_lon: number
        }
        Returns: {
          age: number
          body_type: string
          display_name: string
          distance_km: number
          gender: string
          height_cm: number
          skin_color: string
          user_id: string
        }[]
      }
      get_notification_count_for_email: {
        Args: { email_address: string }
        Returns: number
      }
      get_user_approximate_location: {
        Args: { user_profile_id: string }
        Returns: {
          approximate_lat: number
          approximate_lon: number
          city: string
          country: string
        }[]
      }
      get_user_crushes: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email_id: string
          email_sent: boolean
          error_message: string
          id: string
          sender_user_id: string
          updated_at: string
        }[]
      }
      get_user_location: {
        Args: { user_profile_id: string }
        Returns: {
          city: string
          country: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      simple_notification_insert: {
        Args: { crush_uuid: string; email_addr: string }
        Returns: string
      }
      validate_email_format: {
        Args: { email_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
