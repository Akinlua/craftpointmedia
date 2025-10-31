import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { campaignsApi } from '@/lib/api/campaigns';
import { Campaign } from '@/types/campaign';
import { TrendingUp, TrendingDown, Mail, MessageSquare, Users, MousePointer } from 'lucide-react';

interface CampaignMetricsProps {
  campaign: Campaign;
}

// Mock time series data for charts
const mockTimeSeriesData = [
  { time: '00:00', opens: 0, clicks: 0, sent: 0 },
  { time: '04:00', opens: 45, clicks: 8, sent: 200 },
  { time: '08:00', opens: 120, clicks: 25, sent: 400 },
  { time: '12:00', opens: 280, clicks: 55, sent: 600 },
  { time: '16:00', opens: 420, clicks: 78, sent: 800 },
  { time: '20:00', opens: 520, clicks: 95, sent: 1000 },
  { time: '24:00', opens: 580, clicks: 110, sent: 1245 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function CampaignMetrics({ campaign }: CampaignMetricsProps) {
  const { data: metrics } = useQuery({
    queryKey: ['campaignMetrics', campaign.id],
    queryFn: () => campaignsApi.getCampaignMetrics(campaign.id),
  });

  if (!metrics) {
    return <div>Loading metrics...</div>;
  }

  const pieData = [
    { name: 'Delivered', value: campaign.stats.delivered, color: '#10b981' },
    { name: 'Opened', value: campaign.stats.opened || 0, color: '#3b82f6' },
    { name: 'Clicked', value: campaign.stats.clicked || 0, color: '#f59e0b' },
    { name: 'Bounced', value: campaign.stats.bounced, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deliveryRate.toFixed(1)}%</div>
            <Progress value={metrics.deliveryRate} className="mt-2" />
          </CardContent>
        </Card>

        {campaign.type === 'email' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.openRate?.toFixed(1) || 0}%</div>
                <Progress value={metrics.openRate || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.clickRate?.toFixed(1) || 0}%</div>
                <Progress value={metrics.clickRate || 0} className="mt-2" />
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bounceRate.toFixed(1)}%</div>
            <Progress value={metrics.bounceRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          {campaign.type === 'email' && <TabsTrigger value="engagement">Engagement</TabsTrigger>}
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="sent" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="opens" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                  {campaign.type === 'email' && (
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stackId="3" 
                      stroke="#ffc658" 
                      fill="#ffc658" 
                      fillOpacity={0.3}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Results Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="lg:w-1/2 space-y-4">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {((item.value / campaign.stats.sent) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {campaign.type === 'email' && (
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Email Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTimeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="opens" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Status and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge 
                variant={campaign.status === 'completed' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {campaign.status}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(campaign.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                Total sent: {campaign.stats.sent.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                To {campaign.audience.size.toLocaleString()} contacts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}