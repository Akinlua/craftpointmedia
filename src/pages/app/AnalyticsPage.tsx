import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  Mail,
  Phone,
  Calendar
} from "lucide-react";

const AnalyticsPage = () => {
  const kpiCards = [
    {
      title: "Total Revenue",
      value: "$247,580",
      change: "+18.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "New Contacts",
      value: "1,247",
      change: "+12.3%", 
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "-2.1%",
      trend: "down",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Email Open Rate",
      value: "32.5%",
      change: "+5.7%",
      trend: "up",
      icon: Mail,
      color: "text-orange-600"
    }
  ];

  const salesData = [
    { month: "Jan", revenue: 45000, deals: 12 },
    { month: "Feb", revenue: 52000, deals: 15 },
    { month: "Mar", revenue: 48000, deals: 13 },
    { month: "Apr", revenue: 61000, deals: 18 },
    { month: "May", revenue: 55000, deals: 16 },
    { month: "Jun", revenue: 67000, deals: 21 }
  ];

  const leadSources = [
    { source: "Website", count: 435, percentage: 35 },
    { source: "Social Media", count: 287, percentage: 23 },
    { source: "Email Campaign", count: 198, percentage: 16 },
    { source: "Referrals", count: 156, percentage: 13 },
    { source: "Cold Outreach", count: 124, percentage: 10 },
    { source: "Other", count: 42, percentage: 3 }
  ];

  const topPerformers = [
    { name: "Sarah Johnson", deals: 23, revenue: "$156,400", avatar: "SJ" },
    { name: "Mike Davis", deals: 19, revenue: "$134,200", avatar: "MD" },
    { name: "Emily Wilson", deals: 17, revenue: "$98,700", avatar: "EW" },
    { name: "John Smith", deals: 15, revenue: "$87,300", avatar: "JS" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your business performance and insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption uppercase tracking-wide font-medium">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((data, index) => (
                <div key={data.month} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{data.month}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">${data.revenue.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{data.deals} deals</span>
                    </div>
                    <Progress value={(data.revenue / 70000) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadSources.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{source.source}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{source.count}</div>
                      <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                    </div>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.name} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{performer.avatar}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{performer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {performer.deals} deals • {performer.revenue}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {performer.deals} deals
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary-subtle rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Calls Made</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">47</div>
                  <div className="text-xs text-success">+12% vs yesterday</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">Emails Sent</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">156</div>
                  <div className="text-xs text-success">+8% vs yesterday</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">Meetings Booked</div>
                    <div className="text-xs text-muted-foreground">This week</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">23</div>
                  <div className="text-xs text-success">+18% vs last week</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;