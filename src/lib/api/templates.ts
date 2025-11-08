import { supabase } from '@/integrations/supabase/client';
import type { EmailTemplate, CreateTemplateData } from '@/types/campaign';

const transformTemplate = (row: any): EmailTemplate => ({
  id: row.id,
  orgId: row.org_id,
  name: row.name,
  subject: row.subject,
  content: row.content,
  variables: row.variables || [],
  category: row.category,
  isActive: row.is_active,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const templatesApi = {
  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformTemplate);
  },

  async getTemplateById(id: string): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transformTemplate(data);
  },

  async createTemplate(templateData: CreateTemplateData): Promise<EmailTemplate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        org_id: profile.org_id,
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content,
        variables: templateData.variables || [],
        category: templateData.category,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return transformTemplate(data);
  },

  async updateTemplate(id: string, updates: Partial<CreateTemplateData>): Promise<EmailTemplate> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.variables !== undefined) updateData.variables = updates.variables;
    if (updates.category !== undefined) updateData.category = updates.category;

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformTemplate(data);
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
