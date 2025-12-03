import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { campaignsApi } from '@/lib/api/campaigns';
import { Mail, Calendar, Users, MousePointerClick, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data: campaign, isLoading } = useQuery({
        queryKey: ['campaign', id],
        queryFn: () => campaignsApi.getEmailCampaignById(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return <div className="p-8 text-center">Loading campaign details...</div>;
    }

    if (!campaign) {
        return <div className="p-8 text-center">Campaign not found</div>;
    }

    const stats = [
        {
            title: 'Sent',
            value: campaign.statistics.sent,
            icon: Mail,
        },
        {
            title: 'Opened',
            value: campaign.statistics.opened,
            icon: Users,
            subtext: campaign.statistics.sent > 0
                ? `${((campaign.statistics.opened / campaign.statistics.sent) * 100).toFixed(1)}% rate`
                : '0% rate',
        },
        {
            title: 'Clicked',
            value: campaign.statistics.clicked,
            icon: MousePointerClick,
            subtext: campaign.statistics.sent > 0
                ? `${((campaign.statistics.clicked / campaign.statistics.sent) * 100).toFixed(1)}% rate`
                : '0% rate',
        },
        {
            title: 'Bounced',
            value: campaign.statistics.bounced,
            icon: TrendingUp,
        },
    ];

    return (
        <div className="flex flex-col gap-6 p-6">
            <PageHeader
                title={campaign.name}
                description={`Subject: ${campaign.subject}`}
            >
                <Badge variant="outline" className="capitalize">
                    {campaign.status}
                </Badge>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.subtext && (
                                <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Content Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md p-4 bg-muted/10 min-h-[300px] whitespace-pre-wrap">
                            {campaign.content}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">From</p>
                            <p>{campaign.fromName} &lt;{campaign.fromEmail}&gt;</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Target</p>
                            <p className="capitalize">{campaign.targetType}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Created</p>
                            <p>{format(new Date(campaign.createdAt), 'PPP')}</p>
                        </div>
                        {campaign.scheduledAt && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Scheduled For</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p>{format(new Date(campaign.scheduledAt), 'PPP p')}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
