import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import { settingsApi } from "@/lib/api/settings";
import BillingSummary from "@/components/settings/BillingSummary";

const BillingPage = () => {
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: settingsApi.getCurrentSubscription,
  });

  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: settingsApi.getPaymentMethods,
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: settingsApi.getInvoices,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: settingsApi.getBillingPlans,
  });

  const isLoading = subscriptionLoading || paymentMethodsLoading || invoicesLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription || !paymentMethods || !invoices || !plans) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and billing information
          </p>
        </div>
        <Card className="card-subtle">
          <CardContent className="p-6 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Unable to load billing information</h3>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Billing Summary */}
      <BillingSummary 
        subscription={subscription}
        paymentMethods={paymentMethods}
        invoices={invoices}
        plans={plans}
      />
    </div>
  );
};

export default BillingPage;