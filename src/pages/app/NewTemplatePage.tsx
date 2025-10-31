import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateEditor } from '@/components/marketing/TemplateEditor';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewTemplatePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/marketing/templates')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
          <p className="text-muted-foreground">
            Design a new email or SMS template
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateEditor />
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTemplatePage;