import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Deal } from "@/types/deal";
import { dealsApi } from "@/lib/api/deals";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, Calendar, User } from "lucide-react";
import { AddDealModal } from "@/components/deals/AddDealModal";

const DealsPage = () => {
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const result = await dealsApi.getDeals();
      setDeals(result.data);
    } catch (error) {
      console.error('Error loading deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: "new", title: "New", color: "bg-slate-100 dark:bg-slate-800" },
    { id: "contacted", title: "Contacted", color: "bg-blue-100 dark:bg-blue-900" },
    { id: "proposal", title: "Proposal", color: "bg-yellow-100 dark:bg-yellow-900" },
    { id: "closed_won", title: "Closed Won", color: "bg-green-100 dark:bg-green-900" },
    { id: "closed_lost", title: "Closed Lost", color: "bg-red-100 dark:bg-red-900" }
  ];

  const getPriorityColor = (probability?: number) => {
    if (!probability) return "bg-muted text-muted-foreground";
    if (probability >= 80) return "bg-green-500 text-white";
    if (probability >= 60) return "bg-yellow-500 text-white";
    if (probability >= 40) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getDealsForStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getTotalValueForStage = (stageId: string) => {
    return getDealsForStage(stageId).reduce((sum, deal) => sum + deal.value, 0);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    
    if (draggedDeal) {
      const deal = deals.find(d => d.id === draggedDeal);
      if (deal && deal.stage !== targetStage) {
        try {
          await dealsApi.updateDealStage(draggedDeal, targetStage);
          
          toast({
            title: "Deal moved",
            description: `${deal.title} moved to ${stages.find(s => s.id === targetStage)?.title}`,
          });
          
          loadDeals();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update deal stage",
            variant: "destructive"
          });
        }
      }
    }
    
    setDraggedDeal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your deals through the sales process
          </p>
        </div>
        <Button className="btn-primary gap-2" onClick={() => setShowAddDeal(true)}>
          <Plus className="w-4 h-4" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = getDealsForStage(stage.id);
          const totalValue = getTotalValueForStage(stage.id);
          
          return (
            <Card key={stage.id} className="card-subtle">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-medium text-sm">{stage.title}</h3>
                  <p className="text-2xl font-bold mt-2">{stageDeals.length}</p>
                  <p className="text-sm text-muted-foreground">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
        {stages.map((stage) => {
          const stageDeals = getDealsForStage(stage.id);
          
          return (
            <div
              key={stage.id}
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={`p-3 rounded-lg ${stage.color}`}>
                <h3 className="font-medium text-sm text-center">
                  {stage.title} ({stageDeals.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="card-elevated cursor-move hover:shadow-lg transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm">{deal.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {deal.contacts.map(c => c.name).join(', ')}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-success" />
                            <span className="text-sm font-semibold">
                              ${deal.value.toLocaleString()}
                            </span>
                          </div>
                          <Badge className={`text-xs ${getPriorityColor(deal.probability)}`}>
                            {deal.probability}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {deal.ownerAvatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{deal.ownerName}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Close: {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AddDealModal
        open={showAddDeal}
        onOpenChange={setShowAddDeal}
      />
    </div>
  );
};

export default DealsPage;