import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Template, TemplateType, MergeField } from '@/types/template';
import { templatesApi } from '@/lib/api/templates';
import { useSession } from '@/lib/hooks/useSession';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, Code, Type, Plus, Check } from 'lucide-react';

interface TemplateEditorProps {
  templateId?: string;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const navigate = useNavigate();
  const { profile } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [template, setTemplate] = useState<Partial<Template>>({
    type: 'email',
    status: 'draft',
    content: { body: '' },
    tags: [],
    variables: [],
    ownerId: user?.id || '',
    orgId: user?.orgId || ''
  });

  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [characterCount, setCharacterCount] = useState(0);
  const [mergeFieldsOpen, setMergeFieldsOpen] = useState(false);

  const { data: existingTemplate } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templatesApi.getTemplate(templateId!),
    enabled: !!templateId,
  });

  const { data: mergeFields } = useQuery({
    queryKey: ['mergeFields'],
    queryFn: templatesApi.getMergeFields,
  });

  useEffect(() => {
    if (existingTemplate) {
      setTemplate(existingTemplate);
    }
  }, [existingTemplate]);

  useEffect(() => {
    setCharacterCount(template.content?.body?.length || 0);
  }, [template.content?.body]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Template>) => 
      templateId 
        ? templatesApi.updateTemplate(templateId, data)
        : templatesApi.createTemplate(data as Omit<Template, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: templateId ? 'Template updated' : 'Template created' });
      navigate('/app/marketing/templates');
    },
  });

  const validateMutation = useMutation({
    mutationFn: templatesApi.validateTemplate,
  });

  const updateTemplate = (updates: Partial<Template>) => {
    setTemplate(prev => ({ ...prev, ...updates }));
  };

  const insertMergeField = (field: MergeField) => {
    const currentBody = template.content?.body || '';
    const newBody = currentBody + `{{${field.key}}}`;
    
    updateTemplate({
      content: { ...template.content, body: newBody },
      variables: [...(template.variables || []), field.key].filter((v, i, arr) => arr.indexOf(v) === i)
    });
    
    setMergeFieldsOpen(false);
  };

  const addTag = (tag: string) => {
    if (tag && !template.tags?.includes(tag)) {
      updateTemplate({
        tags: [...(template.tags || []), tag]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTemplate({
      tags: template.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleSave = async () => {
    // Validate template before saving
    if (template.content?.body) {
      const validation = await validateMutation.mutateAsync(template.content.body);
      if (!validation.isValid) {
        toast({
          title: 'Validation errors',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }
    }

    saveMutation.mutate(template);
  };

  const getSegmentCount = (text: string) => {
    // SMS segment calculation (160 chars for single, 153 for multi-segment)
    if (text.length <= 160) return 1;
    return Math.ceil(text.length / 153);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Input
              value={template.name || ''}
              onChange={(e) => updateTemplate({ name: e.target.value })}
              placeholder="Template name"
              className="text-lg font-medium"
            />
            <Select
              value={template.type}
              onValueChange={(value) => updateTemplate({ type: value as TemplateType })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="sms">📱 SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {templateId ? 'Update' : 'Save'} Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Email Subject */}
          {template.type === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={template.subject || ''}
                onChange={(e) => updateTemplate({ subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>
          )}

          {/* Content Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              {template.type === 'email' && (
                <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'visual' | 'code')}>
                  <TabsList className="grid w-auto grid-cols-2">
                    <TabsTrigger value="visual">
                      <Type className="mr-2 h-4 w-4" />
                      Visual
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code className="mr-2 h-4 w-4" />
                      HTML
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>

            <div className="border rounded-lg">
              <div className="flex items-center justify-between p-2 border-b bg-muted">
                <div className="flex items-center gap-2">
                  <Popover open={mergeFieldsOpen} onOpenChange={setMergeFieldsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Insert Field
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search merge fields..." />
                        <CommandList>
                          <CommandEmpty>No merge fields found.</CommandEmpty>
                          {mergeFields && Object.entries(
                            mergeFields.reduce((acc, field) => {
                              if (!acc[field.category]) acc[field.category] = [];
                              acc[field.category].push(field);
                              return acc;
                            }, {} as Record<string, MergeField[]>)
                          ).map(([category, fields]) => (
                            <CommandGroup key={category} heading={category}>
                              {fields.map((field) => (
                                <CommandItem
                                  key={field.key}
                                  onSelect={() => insertMergeField(field)}
                                  className="flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-medium">{field.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {field.example}
                                    </div>
                                  </div>
                                  <code className="text-xs bg-muted px-1 rounded">
                                    {`{{${field.key}}}`}
                                  </code>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {template.type === 'sms' && (
                  <div className="text-sm text-muted-foreground">
                    {characterCount}/160 chars • {getSegmentCount(template.content?.body || '')} segment{getSegmentCount(template.content?.body || '') !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <Textarea
                value={template.content?.body || ''}
                onChange={(e) => updateTemplate({
                  content: { ...template.content, body: e.target.value }
                })}
                placeholder={template.type === 'email' 
                  ? "Enter your email content here..."
                  : "Enter your SMS message here..."
                }
                rows={template.type === 'email' ? 12 : 6}
                className="border-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={template.status}
              onValueChange={(value) => updateTemplate({ status: value as 'draft' | 'published' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {template.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      addTag(target.value);
                      target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Variables Used */}
          {template.variables && template.variables.length > 0 && (
            <div className="space-y-2">
              <Label>Variables Used</Label>
              <div className="space-y-1">
                {template.variables.map((variable) => (
                  <div key={variable} className="flex items-center gap-2 text-sm">
                    <Check className="h-3 w-3 text-green-500" />
                    <code className="bg-muted px-1 rounded text-xs">
                      {`{{${variable}}}`}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation */}
          {validateMutation.data && (
            <div className="space-y-2">
              <Label>Validation</Label>
              <div className={`p-3 rounded-lg text-sm ${
                validateMutation.data.isValid 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {validateMutation.data.isValid ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Template is valid
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-medium">Validation errors:</div>
                    {validateMutation.data.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}