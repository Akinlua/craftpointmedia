import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Users, 
  Database, 
  Activity,
  Check,
  Star,
  ExternalLink
} from "lucide-react";
import { BillingPlan, Subscription, PaymentMethod, Invoice } from "@/types/billing";
import { formatDistanceToNow, format } from "date-fns";

interface BillingSummaryProps {
  subscription: Subscription;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  plans: BillingPlan[];
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

const getStatusInfo = (status: Subscription['status']) => {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'default' as const, color: 'text-success' };
    case 'canceled':
      return { label: 'Canceled', variant: 'destructive' as const, color: 'text-destructive' };
    case 'past_due':
      return { label: 'Past Due', variant: 'destructive' as const, color: 'text-destructive' };
    case 'incomplete':
      return { label: 'Incomplete', variant: 'outline' as const, color: 'text-warning' };
    case 'trialing':
      return { label: 'Trial', variant: 'secondary' as const, color: 'text-primary' };
    default:
      return { label: 'Unknown', variant: 'outline' as const, color: 'text-muted-foreground' };
  }
};

const BillingSummary = ({ subscription, paymentMethods, invoices, plans }: BillingSummaryProps) => {
  const statusInfo = getStatusInfo(subscription.status);
  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault);

  const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatLimit = (limit: number | 'unlimited') => {
    return limit === 'unlimited' ? 'Unlimited' : limit.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription.plan.popular && <Star className="w-4 h-4 text-warning" />}
                {subscription.plan.name} Plan
              </CardTitle>
              <CardDescription>{subscription.plan.description}</CardDescription>
            </div>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(subscription.plan.price, subscription.plan.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                per {subscription.plan.interval}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                Next billing: {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan Features */}
          <div>
            <h4 className="font-medium mb-3">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Usage */}
          <div>
            <h4 className="font-medium mb-3">Current Usage</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contacts
                  </div>
                  <span>
                    {subscription.usage.contacts.toLocaleString()} / {formatLimit(subscription.plan.limits.contacts)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.contacts, subscription.plan.limits.contacts)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Members
                  </div>
                  <span>
                    {subscription.usage.users} / {formatLimit(subscription.plan.limits.users)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.users, subscription.plan.limits.users)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Storage
                  </div>
                  <span>
                    {subscription.usage.storage.toFixed(1)} GB / {subscription.plan.limits.storage}
                  </span>
                </div>
                <Progress value={50} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    API Calls
                  </div>
                  <span>
                    {subscription.usage.apiCalls.toLocaleString()} / {formatLimit(subscription.plan.limits.apiCalls)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.apiCalls, subscription.plan.limits.apiCalls)} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="btn-primary">
              Upgrade Plan
            </Button>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          {defaultPaymentMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-subtle rounded">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {defaultPaymentMethod.card?.brand.toUpperCase()} •••• {defaultPaymentMethod.card?.last4}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires {defaultPaymentMethod.card?.expMonth}/{defaultPaymentMethod.card?.expYear}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No payment method on file</p>
              <Button variant="outline" size="sm">
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">{invoice.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </div>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {invoices.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No invoices available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="card-subtle">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Compare features and upgrade your plan anytime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === subscription.planId;
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border ${
                    isCurrent ? 'border-primary bg-primary-subtle' : 'border-border'
                  } ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{plan.name}</h4>
                    {plan.popular && (
                      <Badge variant="default" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {formatCurrency(plan.price, plan.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    per {plan.interval}
                  </div>
                  <Button 
                    variant={isCurrent ? "secondary" : "outline"} 
                    size="sm" 
                    className="w-full"
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSummary;