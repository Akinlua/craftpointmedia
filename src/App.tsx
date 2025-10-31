import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import Verify2FAPage from "./pages/auth/Verify2FAPage";
import AcceptInvitationPage from "./pages/auth/AcceptInvitationPage";

// App pages
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/app/DashboardPage";
import ContactsPage from "./pages/app/ContactsPage";
import ContactDetailPage from "./pages/app/ContactDetailPage";
import DealsPage from "./pages/app/DealsPage";
import DealDetailPage from "./pages/app/DealDetailPage";
import InboxPage from "./pages/app/InboxPage";
import TasksPage from "./pages/app/TasksPage";
import AnalyticsPage from "./pages/app/AnalyticsPage";
import SettingsPage from "./pages/app/SettingsPage";
import ProductsPage from "./pages/app/ProductsPage";
import InvoicesPage from "./pages/app/InvoicesPage";
import NewInvoicePage from "./pages/app/NewInvoicePage";
import InvoiceDetailPage from "./pages/app/InvoiceDetailPage";
import CampaignsPage from "./pages/app/CampaignsPage";
import NewCampaignPage from "./pages/app/NewCampaignPage";
import TemplatesPage from "./pages/app/TemplatesPage";
import NewTemplatePage from "./pages/app/NewTemplatePage";
import AutomationsPage from "./pages/app/AutomationsPage";
import AutomationDetailPage from "./pages/app/AutomationDetailPage";
import ReportsPage from "./pages/app/ReportsPage";
import SalesReportPage from "./pages/app/SalesReportPage";
import MarketingReportPage from "./pages/app/MarketingReportPage";
import CustomerReportPage from "./pages/app/CustomerReportPage";

// Agency pages
import AgencyPage from "./pages/app/AgencyPage";
import ServicesPage from "./pages/app/agency/ServicesPage";
import OrdersPage from "./pages/app/agency/OrdersPage";

import ProfilePage from "./pages/app/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login for now */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/verify-2fa" element={<Verify2FAPage />} />
            <Route path="/auth/accept-invitation" element={<AcceptInvitationPage />} />
            
            {/* Protected app routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="contacts/:id" element={<ContactDetailPage />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="deals/:id" element={<DealDetailPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks/all" element={<TasksPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings/*" element={<SettingsPage />} />
              <Route path="sales/products" element={<ProductsPage />} />
              <Route path="sales/invoices" element={<InvoicesPage />} />
              <Route path="sales/invoices/new" element={<NewInvoicePage />} />
              <Route path="sales/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="marketing/campaigns" element={<CampaignsPage />} />
              <Route path="marketing/campaigns/new" element={<NewCampaignPage />} />
              <Route path="marketing/templates" element={<TemplatesPage />} />
              <Route path="marketing/templates/new" element={<NewTemplatePage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="automations/:id" element={<AutomationDetailPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/sales" element={<SalesReportPage />} />
              <Route path="reports/marketing" element={<MarketingReportPage />} />
              <Route path="reports/customers" element={<CustomerReportPage />} />
              <Route path="agency" element={<AgencyPage />} />
              <Route path="agency/services" element={<ServicesPage />} />
              <Route path="agency/orders" element={<OrdersPage />} />
            </Route>
            
            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;