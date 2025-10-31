import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { campaignsApi } from '@/lib/api/campaigns';
import { templatesApi } from '@/lib/api/templates';
import { Campaign, CampaignType } from '@/types/campaign';
import { useSession } from '@/lib/hooks/useSession';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Send, Save } from 'lucide-react';

export function CampaignBuilder() {
  const navigate = useNavigate();
  const { profile } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    type: 'email',
    status: 'draft',
    content: { body: '' },
    audience: { size: 0 },
    schedule: { timezone: 'America/New_York' },
              ownerId: profile?.id || '',
              orgId: profile?.org_id || ''
  });

  const { data: templates } = useQuery({
    queryKey: ['templates', { type: campaignData.type }],
    queryFn: () => templatesApi.getTemplates({ type: campaignData.type }),
  });

  const createMutation = useMutation({
    mutationFn: campaignsApi.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign created successfully' });
      navigate('/app/marketing/campaigns');
    },
  });

  const updateCampaignData = (updates: Partial<Campaign>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    createMutation.mutate(campaignData as Omit<Campaign, 'id' | 'stats' | 'createdAt' | 'updatedAt'>);
  };

  const handleSend = () => {
    const sendData = { ...campaignData, status: 'sending' as const };
    createMutation.mutate(sendData as Omit<Campaign, 'id' | 'stats' | 'createdAt' | 'updatedAt'>);
  };

  const steps = [
    { number: 1, title: 'Type', description: 'Choose campaign type' },
    { number: 2, title: 'Audience', description: 'Select your audience' },
    { number: 3, title: 'Content', description: 'Create your message' },
    { number: 4, title: 'Schedule', description: 'Set send time' },
    { number: 5, title: 'Review', description: 'Review and send' }
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step.number <= currentStep 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              {step.number}
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                step.number < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={campaignData.name || ''}
                  onChange={(e) => updateCampaignData({ name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Tabs
                  value={campaignData.type}
                  onValueChange={(value) => updateCampaignData({ type: value as CampaignType })}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">📧 Email</TabsTrigger>
                    <TabsTrigger value="sms">📱 SMS</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Audience Selection</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="segment-1">VIP Customers</SelectItem>
                    <SelectItem value="segment-2">New Leads</SelectItem>
                    <SelectItem value="custom">Custom Filter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium">Estimated Audience Size</div>
                <div className="text-2xl font-bold">1,250 contacts</div>
              </div>
            </div>
          )}

          {/* Step 3: Content */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New</SelectItem>
                    {templates?.templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {campaignData.type === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={campaignData.content?.subject || ''}
                    onChange={(e) => updateCampaignData({
                      content: { ...campaignData.content, subject: e.target.value }
                    })}
                    placeholder="Enter email subject"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="body">Message Content</Label>
                <Textarea
                  id="body"
                  rows={8}
                  value={campaignData.content?.body || ''}
                  onChange={(e) => updateCampaignData({
                    content: { ...campaignData.content, body: e.target.value }
                  })}
                  placeholder={campaignData.type === 'email' 
                    ? "Enter your email content here..."
                    : "Enter your SMS message here..."
                  }
                />
              </div>
              {campaignData.type === 'sms' && (
                <div className="text-sm text-muted-foreground">
                  Character count: {campaignData.content?.body?.length || 0}/160
                </div>
              )}
            </div>
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Send Options</Label>
                <Tabs defaultValue="now">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="now">Send Now</TabsTrigger>
                    <TabsTrigger value="scheduled">Schedule</TabsTrigger>
                  </TabsList>
                  <TabsContent value="scheduled" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="send-date">Send Date</Label>
                        <Input
                          id="send-date"
                          type="datetime-local"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select defaultValue="America/New_York">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                            <SelectItem value="America/Chicago">Central Time</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Campaign Name</div>
                    <div>{campaignData.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Type</div>
                    <Badge>{campaignData.type}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Audience Size</div>
                  <div>1,250 contacts</div>
                </div>
                {campaignData.type === 'email' && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Subject</div>
                    <div>{campaignData.content?.subject}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Content Preview</div>
                  <div className="p-4 bg-muted rounded-lg max-h-32 overflow-y-auto">
                    {campaignData.content?.body}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep === 5 ? (
                <>
                  <Button variant="outline" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSend}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}