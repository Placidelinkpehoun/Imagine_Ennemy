'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Entity, GameClass } from '../types/game';
import { Badge } from '../components/ui/badge';

interface CanvasTabProps {
  entities: Entity[];
  classes: GameClass[];
  onUpdateEntity: (id: string, updates: Partial<Entity>) => void;
}

const EntityNode = ({ data }: { data: any }) => {
  const { entity, attributes } = data;
  
  return (
    <>
    <div className="bg-card border-2 border-entityCard/30 rounded-lg p-4 min-w-[200px] shadow-card">
      <div className="font-bold text-entityCard mb-2">{entity.name}</div>
      {entity.description && (
        <div className="text-xs text-muted-foreground mb-2">{entity.description}</div>
      )}
      <div className="flex flex-wrap gap-1">
        {attributes.map((attr: any, idx: number) => (
          <Badge
            key={idx}
            className="text-xs"
            style={{
              backgroundColor: `${attr.color}20`,
              color: attr.color,
              borderColor: attr.color,
            }}
          >
            {attr.name}
          </Badge>
        ))}
      </div>
    </div>
    </>
  );
};

const nodeTypes = {
  entity: EntityNode,
};

export const CanvasTab = ({ entities, classes, onUpdateEntity }: CanvasTabProps) => {
  const getAttributeDetails = (entity: Entity) => {
    const attributes: { name: string; color: string }[] = [];
    
    entity.attributeIds.forEach((attrId) => {
      classes.forEach((gameClass) => {
        const attr = gameClass.attributes.find((a) => a.id === attrId);
        if (attr) {
          attributes.push({
            name: attr.name,
            color: gameClass.color,
          });
        }
      });
    });
    
    return attributes;
  };

  const initialNodes: Node[] = entities.map((entity, idx) => ({
    id: entity.id,
    type: 'entity',
    position: entity.position || { x: 100 + idx * 250, y: 100 + (idx % 3) * 200 },
    data: {
      entity,
      attributes: getAttributeDetails(entity),
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const entity = entities.find((e) => e.id === node.id);
      if (entity) {
        onUpdateEntity(entity.id, { position: node.position });
      }
    },
    [entities, onUpdateEntity]
  );

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">Tableau visuel</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualisez et organisez vos entités dans l'espace
        </p>
      </div>
      
      <div className="w-full h-full border border-border rounded-lg overflow-hidden bg-background/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap
            className="bg-card"
            nodeColor={(node) => {
              return 'hsl(var(--entity-card))';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
