import { ENV, API_ENDPOINTS } from '@/lib/config/env';
import type { EmailTemplate, CreateTemplateData } from '@/types/campaign';

const transformTemplate = (row: any): EmailTemplate => ({
  id: row.id,
  orgId: row.orgId || row.org_id,
  name: row.name,
  subject: row.subject,
  content: row.content,
  variables: row.variables || [],
  category: row.category,
  isActive: row.isActive || row.is_active,
  createdBy: row.createdBy || row.created_by,
  createdAt: row.createdAt || row.created_at,
  updatedAt: row.updatedAt || row.updated_at,
});

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('AUTH_TOKEN');

export const templatesApi = {
  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    // The backend docs say 'type' is optional, maybe we should default to 'email' if this is email templates?
    // But the type definition is EmailTemplate, so let's assume type=email if needed, or just fetch all.
    // The original code fetched from 'email_templates' table.
    queryParams.append('type', 'email');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TEMPLATES.BASE}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch templates');

    const result = await response.json();
    return (result.data?.templates || []).map(transformTemplate);
  },

  async getTemplateById(id: string): Promise<EmailTemplate> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TEMPLATES.BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch template');

    const data = await response.json();
    return transformTemplate(data.data || data);
  },

  async createTemplate(templateData: CreateTemplateData): Promise<EmailTemplate> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TEMPLATES.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...templateData, type: 'email' })
    });

    if (!response.ok) throw new Error('Failed to create template');

    const data = await response.json();
    return transformTemplate(data.data || data);
  },

  async updateTemplate(id: string, updates: Partial<CreateTemplateData>): Promise<EmailTemplate> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TEMPLATES.BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update template');

    const data = await response.json();
    return transformTemplate(data.data || data);
  },

  async deleteTemplate(id: string): Promise<void> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${ENV.API_BASE_URL}${API_ENDPOINTS.TEMPLATES.BASE}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete template');
  },
};
