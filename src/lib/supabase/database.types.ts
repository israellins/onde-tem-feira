export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      feira_confirmations: {
        Row: {
          confirmed_on: string;
          created_at: string;
          feira_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          confirmed_on?: string;
          created_at?: string;
          feira_id: string;
          status: string;
          user_id?: string;
        };
        Update: {
          confirmed_on?: string;
          created_at?: string;
          feira_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feira_confirmations_feira_id_fkey";
            columns: ["feira_id"];
            isOneToOne: false;
            referencedRelation: "feiras";
            referencedColumns: ["id"];
          },
        ];
      };
      feira_suggestions: {
        Row: {
          comment: string | null;
          created_at: string;
          feira_id: string | null;
          id: string;
          kind: string;
          payload: NonNullable<Json>;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          feira_id?: string | null;
          id?: string;
          kind: string;
          payload: NonNullable<Json>;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          user_id?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          feira_id?: string | null;
          id?: string;
          kind?: string;
          payload?: NonNullable<Json>;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feira_suggestions_feira_id_fkey";
            columns: ["feira_id"];
            isOneToOne: false;
            referencedRelation: "feiras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feira_suggestions_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feira_suggestions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feiras: {
        Row: {
          accuracy: string;
          active: boolean;
          address: string | null;
          city: string;
          created_at: string;
          days_of_week: string[];
          hours: string | null;
          id: string;
          lat: number;
          lng: number;
          name: string;
          neighborhood: string;
          source: string;
          updated_at: string;
          verified: boolean;
        };
        Insert: {
          accuracy?: string;
          active?: boolean;
          address?: string | null;
          city: string;
          created_at?: string;
          days_of_week: string[];
          hours?: string | null;
          id: string;
          lat: number;
          lng: number;
          name: string;
          neighborhood: string;
          source: string;
          updated_at?: string;
          verified?: boolean;
        };
        Update: {
          accuracy?: string;
          active?: boolean;
          address?: string | null;
          city?: string;
          created_at?: string;
          days_of_week?: string[];
          hours?: string | null;
          id?: string;
          lat?: number;
          lng?: number;
          name?: string;
          neighborhood?: string;
          source?: string;
          updated_at?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      post_reports: {
        Row: {
          created_at: string;
          post_id: string;
          reason: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          post_id: string;
          reason: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          post_id?: string;
          reason?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          created_at: string;
          feira_id: string;
          hidden: boolean;
          id: string;
          photo_path: string | null;
          price_reports: NonNullable<Json>;
          rating: number | null;
          text: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          feira_id: string;
          hidden?: boolean;
          id?: string;
          photo_path?: string | null;
          price_reports?: NonNullable<Json>;
          rating?: number | null;
          text: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          feira_id?: string;
          hidden?: boolean;
          id?: string;
          photo_path?: string | null;
          price_reports?: NonNullable<Json>;
          rating?: number | null;
          text?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_feira_id_fkey";
            columns: ["feira_id"];
            isOneToOne: false;
            referencedRelation: "feiras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          is_admin: boolean;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          is_admin?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      shopping_items: {
        Row: {
          added_by: string | null;
          category: string;
          completed: boolean;
          created_at: string;
          id: string;
          item: string;
          price_estimate: number | null;
          quantity: string;
          user_id: string;
        };
        Insert: {
          added_by?: string | null;
          category?: string;
          completed?: boolean;
          created_at?: string;
          id?: string;
          item: string;
          price_estimate?: number | null;
          quantity?: string;
          user_id?: string;
        };
        Update: {
          added_by?: string | null;
          category?: string;
          completed?: boolean;
          created_at?: string;
          id?: string;
          item?: string;
          price_estimate?: number | null;
          quantity?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_items_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_list_shares: {
        Row: {
          created_at: string;
          member_email: string;
          member_id: string;
          owner_id: string;
        };
        Insert: {
          created_at?: string;
          member_email: string;
          member_id: string;
          owner_id: string;
        };
        Update: {
          created_at?: string;
          member_email?: string;
          member_id?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_shares_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_shares_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_suggestion: { Args: { note?: string; suggestion_id: string }; Returns: string };
      can_access_shopping_list: { Args: { list_owner: string }; Returns: boolean };
      delete_my_account: { Args: Record<PropertyKey, never>; Returns: undefined };
      feira_confirmation_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          confirmations_30d: number;
          feira_id: string;
          last_confirmed_on: string;
          not_found_30d: number;
        }[];
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      reject_suggestion: { Args: { note?: string; suggestion_id: string }; Returns: undefined };
      share_shopping_list: { Args: { target_email: string }; Returns: string };
      slugify: { Args: { value: string }; Returns: string };
      valid_price_reports: { Args: { reports: Json }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
