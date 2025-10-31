import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plug, 
  Search, 
  ExternalLink, 
  Zap,
  Webhook,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { settingsApi } from "@/lib/api/settings";
import IntegrationCard from "@/components/settings/IntegrationCard";
import { useState } from "react";

const IntegrationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: settingsApi.getIntegrations,
  });

  const filteredIntegrations = integrations?.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedCount = integrations?.filter(i => i.status === 'connected').length || 0;
  const errorCount = integrations?.filter(i => i.status === 'error').length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your favorite apps and services to streamline your workflow
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">{connectedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{integrations?.length || 0}</p>
              </div>
              <Plug className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-subtle">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold">{errorCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="card-subtle">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Banner */}
      {errorCount > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Integration Issues Detected</p>
                <p className="text-sm text-muted-foreground">
                  {errorCount} integration{errorCount > 1 ? 's have' : ' has'} connection issues. Please check your settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIntegrations?.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Automation Tools */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Automation Tools
          </CardTitle>
          <CardDescription>
            Connect workflow automation tools to create custom integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Zapier */}
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Zapier</h4>
                    <p className="text-sm text-muted-foreground">5000+ app integrations</p>
                  </div>
                </div>
                <Badge variant="outline">Popular</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with thousands of apps to automate your workflows
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Zapier
              </Button>
            </div>

            {/* Make.com */}
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Make (Integromat)</h4>
                    <p className="text-sm text-muted-foreground">Visual automation</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Create complex automations with visual scenario builder
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Make
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Webhooks */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Custom Webhooks
          </CardTitle>
          <CardDescription>
            Set up custom webhook endpoints for real-time data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhooks/crm"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                Add Webhook
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This URL will receive real-time notifications when data changes in your CRM
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Available Events</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'contact.created',
                'contact.updated', 
                'deal.created',
                'deal.updated',
                'task.created',
                'invoice.paid',
                'campaign.sent',
                'user.invited'
              ].map((event) => (
                <Badge key={event} variant="outline" className="justify-center text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium mb-1">Authentication</p>
            <p className="text-xs text-muted-foreground">
              Webhooks are signed with HMAC-SHA256. The signature is sent in the 
              <code className="mx-1 px-1 bg-background rounded">X-CRM-Signature</code> header.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration Help */}
      <Card className="card-subtle border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-subtle rounded-lg">
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Need a Custom Integration?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Can't find the integration you need? Our team can help build custom connections 
                to your existing tools and workflows.
              </p>
              <Button variant="outline" size="sm">
                Request Integration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;