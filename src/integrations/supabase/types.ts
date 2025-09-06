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
          recipient_email: string
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
      user_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          target_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          target_user_id?: string
          user_id?: string
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
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      can_view_crush: {
        Args: { crush_id: string }
        Returns: boolean
      }
      find_matches_by_distance: {
        Args: {
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
      get_anonymized_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_range: string
          body_type: string
          display_name: string
          gender: string
          height_category: string
          location_country: string
          profile_photo_url: string
          user_id: string
        }[]
      }
      get_anonymous_matches: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_range: string
          anonymous_id: string
          display_name: string
          gender: string
          general_location: string
          has_photo: boolean
        }[]
      }
      get_match_suggestions: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_category: string
          has_photo: boolean
          location_category: string
          suggestion_id: string
        }[]
      }
      get_minimal_match_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_photo: boolean
          is_active: boolean
          match_id: string
        }[]
      }
      get_nearby_matches: {
        Args: { max_distance_km?: number }
        Returns: {
          age_range: string
          display_name: string
          distance_range: string
          has_photo: boolean
          user_id: string
        }[]
      }
      get_own_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          birth_date: string
          display_name: string
          gender: string
          height_cm: number
          latitude: number
          location_city: string
          location_country: string
          longitude: number
          profile_completed: boolean
          profile_photo_url: string
          user_id: string
        }[]
      }
      get_safe_matches: {
        Args: { max_distance_km?: number }
        Returns: {
          age: number
          body_type: string
          display_name: string
          distance_range: string
          gender: string
          height_cm: number
          location_city: string
          location_country: string
          profile_photo_url: string
          skin_color: string
          user_id: string
        }[]
      }
      get_secure_matches: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_range: string
          anonymous_id: string
          body_type: string
          display_name: string
          gender: string
          general_location: string
          has_photo: boolean
          height_category: string
        }[]
      }
      get_ultra_secure_matches: {
        Args: Record<PropertyKey, never>
        Returns: {
          anonymous_ref: string
          basic_info: string
          public_name: string
        }[]
      }
      get_user_crushes: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email_sent: boolean
          id: string
          recipient_email: string
          updated_at: string
        }[]
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
    Enums: {},
  },
} as const
