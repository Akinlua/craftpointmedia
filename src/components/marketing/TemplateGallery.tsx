import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Template, TemplateFilters, TemplateStatus, TemplateType } from '@/types/template';
import { UserRole } from '@/types/user';
import { templatesApi } from '@/lib/api/templates';
import { can } from '@/lib/rbac/can';
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Search, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateGalleryProps {
  templates: Template[];
  isLoading: boolean;
  filters: TemplateFilters;
  onFiltersChange: (filters: Partial<TemplateFilters>) => void;
  userRole: UserRole;
}

export function TemplateGallery({ templates, isLoading, filters, onFiltersChange, userRole }: TemplateGalleryProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: templatesApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Template deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting template', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: templatesApi.duplicateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Template duplicated successfully' });
    },
  });

  const getStatusColor = (status: TemplateStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'published':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: TemplateType) => {
    return type === 'email' ? Mail : MessageSquare;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-32 bg-muted rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => onFiltersChange({ type: value === 'all' ? undefined : value as TemplateType })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFiltersChange({ status: value === 'all' ? undefined : value as TemplateStatus })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const TypeIcon = getTypeIcon(template.type);
          
          return (
            <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <TypeIcon className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-sm font-medium">{template.type} Template</div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{template.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                      {template.isSystem && (
                        <Badge variant="outline">System</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/app/marketing/templates/${template.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/app/marketing/templates/${template.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMutation.mutate(template.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {can(userRole, 'delete', 'templates') && !template.isSystem && (
                        <DropdownMenuItem
                          onClick={() => deleteMutation.mutate(template.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Content Preview */}
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {template.subject && `${template.subject}: `}
                  {template.content.body}
                </div>
                
                {/* Footer */}
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TypeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <div className="text-lg font-medium">No templates found</div>
          <div className="text-sm">Create your first template to get started</div>
          <Link to="/app/marketing/templates/new">
            <Button className="mt-4">Create Template</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function TypeIcon({ className }: { className?: string }) {
  return <Mail className={className} />;
}