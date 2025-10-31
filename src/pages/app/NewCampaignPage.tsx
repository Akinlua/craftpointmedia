import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignBuilder } from '@/components/marketing/CampaignBuilder';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewCampaignPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/marketing/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new email or SMS campaign
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignBuilder />
        </CardContent>
      </Card>
    </div>
  );
}

export default NewCampaignPage;