import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { campaignsApi } from '@/lib/api/campaigns';
import { templatesApi } from '@/lib/api/templates';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const campaignSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().min(1, 'Subject is required'),
    fromName: z.string().min(1, 'From Name is required'),
    fromEmail: z.string().email('Invalid email address'),
    templateId: z.string().optional(),
    content: z.string().min(1, 'Content is required'),
    targetType: z.enum(['all', 'segment', 'tags', 'custom']),
    scheduledAt: z.date().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function NewCampaignPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: templates } = useQuery({
        queryKey: ['templates'],
        queryFn: () => templatesApi.getTemplates(),
    });

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            name: '',
            subject: '',
            fromName: '',
            fromEmail: '',
            content: '',
            targetType: 'all',
        },
    });

    const createCampaignMutation = useMutation({
        mutationFn: (data: any) => campaignsApi.createEmailCampaign(data),
        onSuccess: () => {
            toast({ title: 'Campaign created successfully' });
            navigate('/app/marketing/campaigns');
        },
        onError: (error) => {
            toast({
                title: 'Failed to create campaign',
                description: error.message,
                variant: 'destructive'
            });
            setIsSubmitting(false);
        },
    });

    const onSubmit = (data: CampaignFormValues) => {
        setIsSubmitting(true);
        createCampaignMutation.mutate({
            ...data,
            scheduledAt: data.scheduledAt ? data.scheduledAt.toISOString() : undefined,
        });
    };

    const handleTemplateChange = (templateId: string) => {
        const template = templates?.find(t => t.id === templateId);
        if (template) {
            form.setValue('subject', template.subject);
            form.setValue('content', template.content);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
            <PageHeader
                title="Create Campaign"
                description="Set up a new email campaign"
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Campaign Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Monthly Newsletter" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fromName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fromEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>From Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="templateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Load Template (Optional)</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleTemplateChange(value);
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a template" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {templates?.map((template) => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Selecting a template will overwrite the subject and content below.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Line</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Don't miss out!" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Content</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write your email content here..."
                                                className="min-h-[300px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Targeting & Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="targetType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recipients</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select recipients" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="all">All Contacts</SelectItem>
                                                <SelectItem value="segment">Segment (Coming Soon)</SelectItem>
                                                <SelectItem value="tags">Tags (Coming Soon)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="scheduledAt"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Schedule (Optional)</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Leave blank to save as draft. You can send it immediately from the list.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/app/marketing/campaigns')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Campaign
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
