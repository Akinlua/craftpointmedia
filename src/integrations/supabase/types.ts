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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_recipients: {
        Row: {
          bounce_reason: string | null
          campaign_id: string
          campaign_type: string
          clicked_at: string | null
          contact_id: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          bounce_reason?: string | null
          campaign_id: string
          campaign_type: string
          clicked_at?: string | null
          contact_id: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          bounce_reason?: string | null
          campaign_id?: string
          campaign_type?: string
          clicked_at?: string | null
          contact_id?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      contact_timeline: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_timeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_timeline_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          custom_fields: Json | null
          email: string
          first_name: string
          id: string
          last_contact_at: string | null
          last_name: string
          lead_score: number | null
          lead_stage: string | null
          location: string | null
          org_id: string
          owner_id: string | null
          phone: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email: string
          first_name: string
          id?: string
          last_contact_at?: string | null
          last_name: string
          lead_score?: number | null
          lead_stage?: string | null
          location?: string | null
          org_id: string
          owner_id?: string | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string
          first_name?: string
          id?: string
          last_contact_at?: string | null
          last_name?: string
          lead_score?: number | null
          lead_stage?: string | null
          location?: string | null
          org_id?: string
          owner_id?: string | null
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_activities: {
        Row: {
          created_at: string
          created_by: string
          deal_id: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deal_id: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deal_id?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_contacts: {
        Row: {
          contact_id: string
          created_at: string
          deal_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          deal_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          deal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          close_date: string | null
          created_at: string
          currency: string
          custom_fields: Json | null
          description: string | null
          id: string
          last_activity_at: string | null
          org_id: string
          owner_id: string | null
          probability: number | null
          stage: string
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          close_date?: string | null
          created_at?: string
          currency?: string
          custom_fields?: Json | null
          description?: string | null
          id?: string
          last_activity_at?: string | null
          org_id: string
          owner_id?: string | null
          probability?: number | null
          stage?: string
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          close_date?: string | null
          created_at?: string
          currency?: string
          custom_fields?: Json | null
          description?: string | null
          id?: string
          last_activity_at?: string | null
          org_id?: string
          owner_id?: string | null
          probability?: number | null
          stage?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          created_by: string
          from_email: string
          from_name: string
          id: string
          name: string
          org_id: string
          scheduled_at: string | null
          sent_at: string | null
          settings: Json | null
          statistics: Json | null
          status: string
          subject: string
          target_filter: Json | null
          target_type: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          from_email: string
          from_name: string
          id?: string
          name: string
          org_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          settings?: Json | null
          statistics?: Json | null
          status?: string
          subject: string
          target_filter?: Json | null
          target_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          from_email?: string
          from_name?: string
          id?: string
          name?: string
          org_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          settings?: Json | null
          statistics?: Json | null
          status?: string
          subject?: string
          target_filter?: Json | null
          target_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_activities: {
        Row: {
          channel: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_activities_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          line_total: number
          product_id: string | null
          product_name: string
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          line_total?: number
          product_id?: string | null
          product_name: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          line_total?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contact_id: string
          created_at: string
          currency: string
          due_date: string | null
          id: string
          notes: string | null
          number: string
          org_id: string
          owner_id: string
          paid_at: string | null
          payment_terms: number | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          total: number
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          number: string
          org_id: string
          owner_id: string
          paid_at?: string | null
          payment_terms?: number | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          number?: string
          org_id?: string
          owner_id?: string
          paid_at?: string | null
          payment_terms?: number | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scoring_rules: {
        Row: {
          condition_config: Json | null
          condition_type: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          points: number
          updated_at: string
        }
        Insert: {
          condition_config?: Json | null
          condition_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          points?: number
          updated_at?: string
        }
        Update: {
          condition_config?: Json | null
          condition_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_deal_updates: boolean | null
          email_enabled: boolean | null
          email_invoice_updates: boolean | null
          email_meeting_reminders: boolean | null
          email_new_leads: boolean | null
          email_task_reminders: boolean | null
          email_team_updates: boolean | null
          email_weekly_digest: boolean | null
          id: string
          inapp_deal_updates: boolean | null
          inapp_enabled: boolean | null
          inapp_invoice_updates: boolean | null
          inapp_meeting_reminders: boolean | null
          inapp_new_leads: boolean | null
          inapp_task_reminders: boolean | null
          inapp_team_updates: boolean | null
          sms_enabled: boolean | null
          sms_meeting_reminders: boolean | null
          sms_task_reminders: boolean | null
          sms_urgent_only: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_deal_updates?: boolean | null
          email_enabled?: boolean | null
          email_invoice_updates?: boolean | null
          email_meeting_reminders?: boolean | null
          email_new_leads?: boolean | null
          email_task_reminders?: boolean | null
          email_team_updates?: boolean | null
          email_weekly_digest?: boolean | null
          id?: string
          inapp_deal_updates?: boolean | null
          inapp_enabled?: boolean | null
          inapp_invoice_updates?: boolean | null
          inapp_meeting_reminders?: boolean | null
          inapp_new_leads?: boolean | null
          inapp_task_reminders?: boolean | null
          inapp_team_updates?: boolean | null
          sms_enabled?: boolean | null
          sms_meeting_reminders?: boolean | null
          sms_task_reminders?: boolean | null
          sms_urgent_only?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_deal_updates?: boolean | null
          email_enabled?: boolean | null
          email_invoice_updates?: boolean | null
          email_meeting_reminders?: boolean | null
          email_new_leads?: boolean | null
          email_task_reminders?: boolean | null
          email_team_updates?: boolean | null
          email_weekly_digest?: boolean | null
          id?: string
          inapp_deal_updates?: boolean | null
          inapp_enabled?: boolean | null
          inapp_invoice_updates?: boolean | null
          inapp_meeting_reminders?: boolean | null
          inapp_new_leads?: boolean | null
          inapp_task_reminders?: boolean | null
          inapp_team_updates?: boolean | null
          sms_enabled?: boolean | null
          sms_meeting_reminders?: boolean | null
          sms_task_reminders?: boolean | null
          sms_urgent_only?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          org_id: string
          priority: string
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          org_id: string
          priority?: string
          read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          org_id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          industry: string | null
          name: string
          owner_id: string | null
          plan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          industry?: string | null
          name: string
          owner_id?: string | null
          plan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          industry?: string | null
          name?: string
          owner_id?: string | null
          plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          org_id: string
          price: number
          sku: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          price?: number
          sku: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          price?: number
          sku?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          org_id: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          org_id: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          org_id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_campaigns: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          name: string
          org_id: string
          scheduled_at: string | null
          sender_id: string
          sent_at: string | null
          settings: Json | null
          statistics: Json | null
          status: string
          target_filter: Json | null
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          name: string
          org_id: string
          scheduled_at?: string | null
          sender_id: string
          sent_at?: string | null
          settings?: Json | null
          statistics?: Json | null
          status?: string
          target_filter?: Json | null
          target_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          name?: string
          org_id?: string
          scheduled_at?: string | null
          sender_id?: string
          sent_at?: string | null
          settings?: Json | null
          statistics?: Json | null
          status?: string
          target_filter?: Json | null
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          org_id: string
          priority: string
          related_id: string | null
          related_type: string | null
          reminder_sent: boolean | null
          reminder_time: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          org_id: string
          priority?: string
          related_id?: string | null
          related_type?: string | null
          reminder_sent?: boolean | null
          reminder_time?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          org_id?: string
          priority?: string
          related_id?: string | null
          related_type?: string | null
          reminder_sent?: boolean | null
          reminder_time?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          actions_log: Json[] | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          started_at: string | null
          status: string
          trigger_data: Json | null
          workflow_id: string
        }
        Insert: {
          actions_log?: Json[] | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          workflow_id: string
        }
        Update: {
          actions_log?: Json[] | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          workflow_id?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          actions: Json[] | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          statistics: Json | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json[] | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          statistics?: Json | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json[] | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          statistics?: Json | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_metadata?: Json
          p_org_id: string
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "manager" | "staff"
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
      app_role: ["owner", "manager", "staff"],
    },
  },
} as const
