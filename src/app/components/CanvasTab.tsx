'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Entity, GameClass, AttributeSpecificity } from '../types/game';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

interface CanvasTabProps {
  entities: Entity[];
  classes: GameClass[];
  onUpdateEntity: (id: string, updates: Partial<Entity>) => void;
}

const EntityNode = ({ data }: { data: any }) => {
  const { entity, attributes } = data;
  
  return (
    <>
    <div className="bg-card border-2 border-entityCard/30 rounded-sm p-4 min-w-[200px] shadow-card">
      <div className="font-bold text-entityCard mb-2">{entity.name}</div>
      {entity.description && (
        <div className="text-xs max-w-80 text-muted-foreground mb-2">{entity.description}</div>
      )}
      <div className="flex flex-col gap-1">
        {attributes.map((attr: any, idx: number) => (
          <Badge
            key={idx}
            className="text-xs w-fit self-start whitespace-nowrap cursor-pointer"
            style={{
              backgroundColor: `${attr.color}20`,
              color: attr.color,
              borderColor: attr.color,
            }}
            onClick={attr.onClick}
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

const AttributeNode = ({ data }: { data: any }) => {
  const { name, color, onClick } = data;
  return (
    <div
      onClick={onClick}
      className="bg-card border rounded-sm px-3 py-2 text-xs shadow-sm cursor-pointer"
      style={{ borderColor: color, color }}
    >
      {name}
    </div>
  );
};

const SpecificityNode = ({ data }: { data: any }) => {
  const { text, onClick } = data;
  return (
    <div
      onClick={onClick}
      className="bg-card border border-muted rounded-sm px-3 py-2 text-xs shadow-sm cursor-pointer max-w-64"
    >
      {text}
    </div>
  );
};

const nodeTypesExtended = {
  entity: EntityNode,
  attribute: AttributeNode,
  specificity: SpecificityNode,
};

export const CanvasTab = ({ entities, classes, onUpdateEntity }: CanvasTabProps) => {
  const [specificities, setSpecificities] = useState<AttributeSpecificity[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogText, setDialogText] = useState('');
  const [dialogEntityId, setDialogEntityId] = useState<string | null>(null);
  const [dialogAttributeId, setDialogAttributeId] = useState<string | null>(null);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);

  // load all specificities
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/specificities', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setSpecificities(json.data as AttributeSpecificity[]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const findAttrMeta = (attrId: string) => {
    for (const gc of classes) {
      const a = gc.attributes.find((x) => x.id === attrId);
      if (a) return { name: a.name, color: gc.color };
    }
    return { name: 'Attr', color: '#8b5cf6' };
  };

  const openSpecDialog = (entityId: string, attributeId: string) => {
    const existing = specificities.find((s) => s.entityId === entityId && s.attributeId === attributeId);
    setEditingSpecId(existing?.id ?? null);
    setDialogEntityId(entityId);
    setDialogAttributeId(attributeId);
    setDialogText(existing?.text ?? '');
    setDialogOpen(true);
  };

  const saveSpecificity = async () => {
    if (!dialogEntityId || !dialogAttributeId) return;
    const body: any = editingSpecId
      ? { id: editingSpecId, text: dialogText }
      : { entityId: dialogEntityId, attributeId: dialogAttributeId, text: dialogText };
    const method = editingSpecId ? 'PATCH' : 'POST';
    const res = await fetch('/api/specificities', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      let next = specificities.slice();
      const spec = json.data as AttributeSpecificity;
      const idx = next.findIndex((s) => s.id === spec.id);
      if (idx >= 0) next[idx] = spec; else next.push(spec);
      setSpecificities(next);
      setDialogOpen(false);
    }
  };

  // recompute nodes/edges from entities + attributes + specificities
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    entities.forEach((entity, i) => {
      const ePos = entity.position || { x: 100 + i * 250, y: 100 + (i % 3) * 200 };
      // Entity node
      newNodes.push({
        id: entity.id,
        type: 'entity',
        position: ePos,
        data: {
          entity,
          attributes: entity.attributeIds.map((attrId) => {
            const meta = findAttrMeta(attrId);
            return {
              name: meta.name,
              color: meta.color,
              onClick: () => openSpecDialog(entity.id, attrId),
              attrId,
            };
          }),
        },
      });

      // Attribute nodes and edges
      entity.attributeIds.forEach((attrId, idx) => {
        const meta = findAttrMeta(attrId);
        const aId = `attr-${entity.id}-${attrId}`;
        const aPos = { x: ePos.x + 180, y: ePos.y + idx * 60 };
        newNodes.push({ id: aId, type: 'attribute', position: aPos, data: { name: meta.name, color: meta.color, onClick: () => openSpecDialog(entity.id, attrId) } });
        newEdges.push({ id: `e-${entity.id}-${aId}`, source: entity.id, target: aId });

        // Specificity node if exists
        const spec = specificities.find((s) => s.entityId === entity.id && s.attributeId === attrId);
        if (spec) {
          const sId = `spec-${spec.id}`;
          const sPos = spec.position || { x: aPos.x + 180, y: aPos.y };
          newNodes.push({ id: sId, type: 'specificity', position: sPos, data: { text: spec.text, onClick: () => {
            setEditingSpecId(spec.id);
            setDialogEntityId(entity.id);
            setDialogAttributeId(attrId);
            setDialogText(spec.text);
            setDialogOpen(true);
          } } });
          newEdges.push({ id: `e-${aId}-${sId}`, source: aId, target: sId });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [entities, classes, specificities, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      const entity = entities.find((e) => e.id === node.id);
      if (entity) {
        onUpdateEntity(entity.id, { position: node.position });
        return;
      }
      // persist specificity node position
      if (node.type === 'specificity' && node.id.startsWith('spec-')) {
        const specId = node.id.replace('spec-', '');
        fetch('/api/specificities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: specId, position: node.position }),
        })
          .then((r) => r.ok ? r.json() : null)
          .then((json) => {
            if (!json?.data) return;
            setSpecificities((prev) => prev.map((s) => (s.id === json.data.id ? { ...s, position: json.data.position } : s)));
          })
          .catch(() => {});
      }
    },
    [entities, onUpdateEntity]
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="w-full h-full border rounded-lg overflow-hidden bg-background/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypesExtended}
          fitView
          style={{ background: '#0b1220' }}
        >
          <Background color="#475569" size={1} gap={18} />
          <Controls/>
          <MiniMap
            style={{ backgroundColor: '#0b1220' }}
            nodeColor={(node) => {
              const data: any = (node as any).data;
              const attrs: Array<{ color: string }> | undefined = data?.attributes;
              const c = attrs && attrs.length > 0 ? attrs[0].color : '#8b5cf6';
              return c;
            }}
            nodeStrokeColor={() => '#334155'}
            nodeBorderRadius={4}
          />
        </ReactFlow>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spécificité de l'attribut</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea value={dialogText} onChange={(e) => setDialogText(e.target.value)} placeholder="Entrez la spécificité..."/>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={saveSpecificity}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
