import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Automation } from '@/types/automation';
import { Play, Pause, Save, Eye, TestTube } from 'lucide-react';

interface AutomationCanvasProps {
  automation: Automation;
  isReadOnly?: boolean;
  onSave?: (automation: Automation) => void;
  onTest?: (automation: Automation) => void;
}

export function AutomationCanvas({ 
  automation, 
  isReadOnly = false, 
  onSave,
  onTest 
}: AutomationCanvasProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Enhanced node mapping with proper colors and labels
  const initialNodes: Node[] = useMemo(() => 
    automation.nodes.map(node => ({
      id: node.id,
      type: node.type === 'trigger' ? 'input' : node.type === 'condition' ? 'default' : 'output',
      position: node.position,
      data: { 
        label: node.data.label,
        nodeType: node.nodeType,
        config: node.data.config
      },
      draggable: !isReadOnly,
      style: {
        backgroundColor: getNodeColor(node.type, node.nodeType),
        border: '2px solid',
        borderColor: getNodeBorderColor(node.type),
        borderRadius: '8px',
        padding: '10px',
        minWidth: '120px',
      },
    })), [automation.nodes, isReadOnly]
  );

  const initialEdges: Edge[] = useMemo(() => 
    automation.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      style: { strokeWidth: 2 },
      animated: !isReadOnly,
    })), [automation.edges, isReadOnly]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isReadOnly) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, isReadOnly]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (!isReadOnly) {
      setSelectedNode(node);
    }
  }, [isReadOnly]);

  function getNodeColor(type: string, nodeType: string) {
    switch (type) {
      case 'trigger': return '#dcfce7'; // green-100
      case 'condition': return '#fef3c7'; // amber-100  
      case 'action':
        switch (nodeType) {
          case 'send_email':
          case 'send_sms': return '#dbeafe'; // blue-100
          case 'wait': return '#fef3c7'; // amber-100
          case 'add_tag':
          case 'remove_tag': return '#f3e8ff'; // purple-100
          default: return '#f1f5f9'; // slate-100
        }
      default: return '#f8fafc'; // slate-50
    }
  }

  function getNodeBorderColor(type: string) {
    switch (type) {
      case 'trigger': return '#22c55e'; // green-500
      case 'condition': return '#f59e0b'; // amber-500
      case 'action': return '#3b82f6'; // blue-500
      default: return '#64748b'; // slate-500
    }
  }

  const handleSave = () => {
    if (onSave) {
      const updatedAutomation: Automation = {
        ...automation,
        nodes: nodes.map(node => ({
          id: node.id,
          type: typeof node.data.nodeType === 'string' && (
            node.data.nodeType.startsWith('contact_') || 
            node.data.nodeType.startsWith('tag_') || 
            node.data.nodeType.startsWith('form_')
          ) ? 'trigger' :
            node.data.nodeType === 'condition' ? 'condition' : 'action',
          nodeType: node.data.nodeType as any,
          position: node.position,
          data: {
            label: String(node.data.label),
            config: node.data.config || {}
          }
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          label: edge.label ? String(edge.label) : undefined,
        }))
      };
      onSave(updatedAutomation);
    }
  };

  const handleTest = () => {
    if (onTest) {
      onTest(automation);
    }
  };

  return (
    <div className="w-full h-full flex">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="top-right"
          style={{ backgroundColor: '#f8fafc' }}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
          
          {!isReadOnly && (
            <Panel position="top-right" className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleTest}>
                <TestTube className="mr-2 h-4 w-4" />
                Test
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </Panel>
          )}
          
          <Panel position="top-left">
            <Card className="w-64">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{automation.name}</CardTitle>
                  <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                    {automation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Runs:</span>
                  <span className="font-medium">{automation.stats.totalRuns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">
                    {automation.stats.totalRuns > 0 
                      ? Math.round((automation.stats.successfulRuns / automation.stats.totalRuns) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && !isReadOnly && (
        <div className="w-80 border-l bg-background p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Node Configuration</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
              ×
            </Button>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Type:</span>
              <Badge className="ml-2">{String(selectedNode.data.nodeType || 'unknown')}</Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Label:</span>
              <div className="text-sm text-muted-foreground">{String(selectedNode.data.label || 'No label')}</div>
            </div>
          </div>

          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Config</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            <TabsContent value="config" className="space-y-2">
              <div className="text-xs">
                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(selectedNode.data.config || {}, null, 2)}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="data" className="space-y-2">
              <div className="text-xs">
                <div className="space-y-1">
                  <div><strong>ID:</strong> {selectedNode.id}</div>
                  <div><strong>Position:</strong> {selectedNode.position.x}, {selectedNode.position.y}</div>
                  <div><strong>Type:</strong> {selectedNode.type}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}