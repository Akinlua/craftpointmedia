import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateGallery } from '@/components/marketing/TemplateGallery';
import { templatesApi } from '@/lib/api/templates';
import { TemplateFilters } from '@/types/template';
import { useSession } from '@/lib/hooks/useSession';
import { Plus } from 'lucide-react';

export function TemplatesPage() {
  const { role } = useSession();
  const [filters, setFilters] = useState<TemplateFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['templates', filters],
    queryFn: () => templatesApi.getTemplates(filters),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage your email and SMS templates
          </p>
        </div>
        <Link to="/app/marketing/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.templates.filter(t => t.type === 'email').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.templates.filter(t => t.type === 'sms').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateGallery
            templates={data?.templates || []}
            isLoading={isLoading}
            filters={filters}
            onFiltersChange={setFilters}
            userRole={role?.role || 'staff'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default TemplatesPage;