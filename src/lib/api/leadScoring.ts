import { supabase } from '@/integrations/supabase/client';
import type { LeadScoringRule, CreateLeadScoringRuleData } from '@/types/workflow';

const transformScoringRule = (row: any): LeadScoringRule => ({
  id: row.id,
  orgId: row.org_id,
  name: row.name,
  conditionType: row.condition_type,
  conditionConfig: row.condition_config,
  points: row.points,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const leadScoringApi = {
  async getScoringRules(): Promise<LeadScoringRule[]> {
    const { data, error } = await supabase
      .from('lead_scoring_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformScoringRule);
  },

  async createScoringRule(ruleData: CreateLeadScoringRuleData): Promise<LeadScoringRule> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('lead_scoring_rules')
      .insert({
        org_id: profile.org_id,
        name: ruleData.name,
        condition_type: ruleData.conditionType,
        condition_config: ruleData.conditionConfig,
        points: ruleData.points,
      })
      .select()
      .single();

    if (error) throw error;
    return transformScoringRule(data);
  },

  async updateScoringRule(id: string, updates: Partial<CreateLeadScoringRuleData>): Promise<LeadScoringRule> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.conditionType !== undefined) updateData.condition_type = updates.conditionType;
    if (updates.conditionConfig !== undefined) updateData.condition_config = updates.conditionConfig;
    if (updates.points !== undefined) updateData.points = updates.points;

    const { data, error } = await supabase
      .from('lead_scoring_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformScoringRule(data);
  },

  async deleteScoringRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('lead_scoring_rules')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async calculateScores(): Promise<void> {
    const { error } = await supabase.functions.invoke('calculate-lead-scores');
    if (error) throw error;
  },
};
