import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Trash, Edit, Copy } from 'lucide-react';
import { templatesApi } from '@/lib/api/templates';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function TemplatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: () => templatesApi.getTemplates(),
    });

    const deleteTemplateMutation = useMutation({
        mutationFn: (id: string) => templatesApi.deleteTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast({ title: 'Template deleted' });
        },
        onError: () => {
            toast({ title: 'Failed to delete template', variant: 'destructive' });
        },
    });

    const filteredTemplates = templates?.filter((template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 p-6">
            <PageHeader
                title="Email Templates"
                description="Manage your email templates for campaigns"
                actions={
                    <Link to="/app/marketing/templates/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Template
                        </Button>
                    </Link>
                }
            />

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredTemplates?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No templates found. Create your first template to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTemplates?.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">
                                        {template.name}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {template.subject}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {template.category}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                            {template.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* Edit functionality would go here, for now just a placeholder or link if we had an edit page */}
                                                {/* <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem> */}
                                                <DropdownMenuItem
                                                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
