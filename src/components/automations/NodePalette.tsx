import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { automationsApi } from '@/lib/api/automations';
import { NodeTypeDefinition } from '@/types/automation';
import { Search, UserPlus, Tag, FileText, Mail, MessageSquare, Plus, Clock, GitBranch } from 'lucide-react';

interface NodePaletteProps {
  onNodeAdd?: (nodeType: NodeTypeDefinition) => void;
}

const iconMap = {
  UserPlus,
  Tag,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Clock,
  GitBranch,
};

export function NodePalette({ onNodeAdd }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: nodeTypes = [] } = useQuery({
    queryKey: ['nodeTypes'],
    queryFn: automationsApi.getNodeTypes,
  });

  const filteredNodes = nodeTypes.filter(node =>
    node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggers = filteredNodes.filter(node => node.category === 'trigger');
  const actions = filteredNodes.filter(node => node.category === 'action');
  const conditions = filteredNodes.filter(node => node.category === 'condition');

  const handleNodeClick = (nodeType: NodeTypeDefinition) => {
    if (onNodeAdd) {
      onNodeAdd(nodeType);
    }
  };

  const NodeItem = ({ node }: { node: NodeTypeDefinition }) => {
    const IconComponent = iconMap[node.icon as keyof typeof iconMap] || Plus;
    
    return (
      <Card 
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={() => handleNodeClick(node)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg shrink-0"
              style={{ backgroundColor: `${node.color}20`, color: node.color }}
            >
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{node.label}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {node.description}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {node.inputs}→{node.outputs}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-80 border-l bg-background h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-medium mb-3">Node Library</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="triggers" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="triggers" className="text-xs">
              Triggers ({triggers.length})
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">
              Actions ({actions.length})
            </TabsTrigger>
            <TabsTrigger value="conditions" className="text-xs">
              Logic ({conditions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="triggers" className="p-4 space-y-2">
            {triggers.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No triggers found
              </div>
            ) : (
              triggers.map((node) => (
                <NodeItem key={node.type} node={node} />
              ))
            )}
          </TabsContent>

          <TabsContent value="actions" className="p-4 space-y-2">
            {actions.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No actions found
              </div>
            ) : (
              actions.map((node) => (
                <NodeItem key={node.type} node={node} />
              ))
            )}
          </TabsContent>

          <TabsContent value="conditions" className="p-4 space-y-2">
            {conditions.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No conditions found
              </div>
            ) : (
              conditions.map((node) => (
                <NodeItem key={node.type} node={node} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">How to use:</div>
          <div>• Click on a node to add it to the canvas</div>
          <div>• Drag between nodes to connect them</div>
          <div>• Click on nodes to configure them</div>
        </div>
      </div>
    </div>
  );
}