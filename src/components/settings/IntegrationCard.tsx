import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Calendar, 
  Smartphone, 
  CreditCard, 
  Calculator, 
  ShoppingCart,
  ExternalLink,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Integration } from "@/types/integration";
import { settingsApi } from "@/lib/api/settings";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface IntegrationCardProps {
  integration: Integration;
}

const getIntegrationIcon = (type: Integration['type']) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'calendar':
      return Calendar;
    case 'sms':
      return Smartphone;
    case 'payment':
      return CreditCard;
    case 'accounting':
      return Calculator;
    case 'ecommerce':
      return ShoppingCart;
    default:
      return Settings;
  }
};

const getStatusInfo = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return { 
        icon: CheckCircle, 
        label: 'Connected', 
        variant: 'default' as const,
        color: 'text-success'
      };
    case 'disconnected':
      return { 
        icon: XCircle, 
        label: 'Disconnected', 
        variant: 'secondary' as const,
        color: 'text-muted-foreground'
      };
    case 'error':
      return { 
        icon: AlertCircle, 
        label: 'Error', 
        variant: 'destructive' as const,
        color: 'text-destructive'
      };
    case 'syncing':
      return { 
        icon: Loader2, 
        label: 'Syncing', 
        variant: 'outline' as const,
        color: 'text-warning'
      };
    default:
      return { 
        icon: XCircle, 
        label: 'Unknown', 
        variant: 'secondary' as const,
        color: 'text-muted-foreground'
      };
  }
};

const IntegrationCard = ({ integration }: IntegrationCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const Icon = getIntegrationIcon(integration.type);
  const statusInfo = getStatusInfo(integration.status);

  const connectMutation = useMutation({
    mutationFn: (creds: any) => settingsApi.connectIntegration(integration.id, creds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Integration connected",
        description: `${integration.name} has been connected successfully.`,
      });
      setIsDialogOpen(false);
      setCredentials({ apiKey: '', secretKey: '', webhookUrl: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => settingsApi.disconnectIntegration(integration.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Integration disconnected",
        description: `${integration.name} has been disconnected.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (integration.status === 'connected') {
      disconnectMutation.mutate();
    } else {
      if (integration.setupUrl) {
        window.open(integration.setupUrl, '_blank');
      } else {
        setIsDialogOpen(true);
      }
    }
  };

  const handleSubmitCredentials = () => {
    connectMutation.mutate(credentials);
  };

  const isConnected = integration.status === 'connected';
  const isLoading = connectMutation.isPending || disconnectMutation.isPending;

  return (
    <>
      <Card className="card-subtle hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-subtle rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{integration.name}</CardTitle>
                <CardDescription className="text-sm">
                  {integration.provider}
                </CardDescription>
              </div>
            </div>
            <Badge variant={statusInfo.variant} className="gap-1">
              <statusInfo.icon className={`w-3 h-3 ${statusInfo.color} ${integration.status === 'syncing' ? 'animate-spin' : ''}`} />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {integration.description}
          </p>
          
          {integration.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Features</h4>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {integration.lastSync && (
            <div className="text-xs text-muted-foreground">
              Last synced {formatDistanceToNow(new Date(integration.lastSync), { addSuffix: true })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch 
                checked={isConnected} 
                onCheckedChange={handleConnect}
                disabled={isLoading}
              />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <div className="flex gap-2">
              {integration.documentationUrl && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(integration.documentationUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant={isConnected ? "outline" : "default"}
                size="sm"
                onClick={handleConnect}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {integration.name}</DialogTitle>
            <DialogDescription>
              Enter your {integration.name} credentials to connect this integration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
              />
            </div>
            
            {integration.type === 'payment' && (
              <div>
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={credentials.secretKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="Enter your secret key"
                />
              </div>
            )}
            
            {integration.type === 'automation' && (
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Textarea
                  id="webhookUrl"
                  value={credentials.webhookUrl}
                  onChange={(e) => setCredentials(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="Enter your webhook URL"
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitCredentials}
              disabled={connectMutation.isPending || !credentials.apiKey}
            >
              {connectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IntegrationCard;