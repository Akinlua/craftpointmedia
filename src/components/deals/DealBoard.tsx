import { useState, useEffect } from "react";
import { Deal } from "@/types/deal";
import { DealCard } from "./DealCard";
import { dealStages } from "@/lib/api/deals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface DealBoardProps {
  dealsByStage: Record<string, Deal[]>;
  onDealClick: (deal: Deal) => void;
  onStageChange: (dealId: string, newStageId: string) => void;
  onEditDeal?: (deal: Deal) => void;
  onDeleteDeal?: (deal: Deal) => void;
  onAddDeal?: (stageId: string) => void;
  loading?: boolean;
}

export const DealBoard = ({
  dealsByStage,
  onDealClick,
  onStageChange,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
  loading
}: DealBoardProps) => {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(value);
  };

  const getStageTotal = (stageId: string) => {
    const deals = dealsByStage[stageId] || [];
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', deal.id);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    
    if (draggedDeal && draggedDeal.stageId !== stageId) {
      onStageChange(dealId, stageId);
    }
    
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const getStageColor = (stageId: string) => {
    const stage = dealStages.find(s => s.id === stageId);
    return stage?.color || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {dealStages.map((stage) => (
          <div key={stage.id} className="min-w-80 flex-shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {dealStages.map((stage) => {
        const deals = dealsByStage[stage.id] || [];
        const stageTotal = getStageTotal(stage.id);
        const isDropTarget = dragOverStage === stage.id && draggedDeal?.stageId !== stage.id;

        return (
          <div key={stage.id} className="min-w-80 flex-shrink-0">
            <Card 
              className={`h-full ${isDropTarget ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStageColor(stage.id)}`}></div>
                    <CardTitle className="text-base">{stage.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {deals.length}
                    </Badge>
                  </div>
                  {onAddDeal && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onAddDeal(stage.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {stageTotal > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Total: {formatCurrency(stageTotal)}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    onDragEnd={handleDragEnd}
                    className="cursor-move"
                  >
                    <DealCard
                      deal={deal}
                      onDealClick={onDealClick}
                      onEditDeal={onEditDeal}
                      onDeleteDeal={onDeleteDeal}
                      isDragging={draggedDeal?.id === deal.id}
                    />
                  </div>
                ))}
                
                {deals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm">No deals in this stage</p>
                    {onAddDeal && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onAddDeal(stage.id)}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Deal
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};