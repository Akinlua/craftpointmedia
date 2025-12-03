import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { templatesApi } from '@/lib/api/templates';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const templateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().min(1, 'Subject is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.enum(['campaign', 'transactional', 'followup']),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export default function NewTemplatePage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            subject: '',
            content: '',
            category: 'campaign',
        },
    });

    const createTemplateMutation = useMutation({
        mutationFn: (data: TemplateFormValues) => templatesApi.createTemplate(data),
        onSuccess: () => {
            toast({ title: 'Template created successfully' });
            navigate('/app/marketing/templates');
        },
        onError: (error) => {
            toast({
                title: 'Failed to create template',
                description: error.message,
                variant: 'destructive'
            });
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: TemplateFormValues) => {
        setIsSubmitting(true);
        // Extract variables from content (simple regex for {{variable}})
        const variables = data.content.match(/{{([^}]+)}}/g)?.map(v => v.replace(/{{|}}/g, '')) || [];

        createTemplateMutation.mutate({
            ...data,
            variables,
        } as any);
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <PageHeader
                title="Create Template"
                description="Design a new email template"
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Welcome Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Subject</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Welcome to our platform!" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="campaign">Campaign</SelectItem>
                                                    <SelectItem value="transactional">Transactional</SelectItem>
                                                    <SelectItem value="followup">Follow-up</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Hello {{name}}, welcome to..."
                                                className="min-h-[300px] font-mono"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Use {'{{variable_name}}'} to insert dynamic variables.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/app/marketing/templates')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Template
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
