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
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Entity, GameClass, Specificity } from '../types/game';
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
    <div className="relative bg-card border-2 border-entityCard/30 rounded-sm p-4 min-w-[200px] shadow-card">
      <div className="font-bold text-entityCard mb-2">{entity.name}</div>
      {entity.description && (
        <div className="text-xs max-w-80 text-muted-foreground mb-2">{entity.description}</div>
      )}
      <div className="flex flex-col gap-1">
        {attributes.map((attr: any, idx: number) => (
          <div
            key={idx}
            onClick={attr.onClick}
            className="bg-card border rounded-sm px-3 py-2 text-xs shadow-sm cursor-pointer w-fit"
            style={{ borderColor: attr.color, color: attr.color }}
            id={`attr-${attr.attrId}`}
          >
            {attr.name}
          </div>
        ))}
      </div>
      {/* Handles positionnés de manière absolue par rapport au nœud */}
      {attributes.map((attr: any, idx: number) => {
        // Calculer la position Y en fonction de l'index
        // Offset pour le titre + description + début des attributs
        const headerHeight = entity.description ? 70 : 50;
        const attrHeight = 42; // hauteur approximative de chaque attribut
        const yPos = headerHeight + (idx * attrHeight) + (attrHeight / 2);
        
        return (
          <Handle
            key={attr.attrId}
            type="source"
            position={Position.Right}
            id={attr.attrId}
            style={{ 
              position: 'absolute',
              right: -6,
              top: `${yPos}px`,
              background: attr.color,
              width: '12px',
              height: '12px',
              border: '2px solid #0b1220',
              transform: 'translateY(-50%)'
            }}
          />
        );
      })}
    </div>
  );
};

const SpecificityNode = ({ data }: { data: any }) => {
  const { text, onClick, attributeName, color } = data;
  return (
    <div className="relative bg-card border rounded-sm shadow-sm cursor-pointer max-w-64" onClick={onClick}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          position: 'absolute',
          left: -6,
          top: '50%',
          background: color || '#8b5cf6',
          width: '12px',
          height: '12px',
          border: '2px solid #0b1220',
          transform: 'translateY(-50%)'
        }}
      />
      {attributeName && (
        <div 
          className="px-3 py-1 text-xs font-medium border-b"
          style={{ borderColor: color, color }}
        >
          {attributeName}
        </div>
      )}
      <div className="px-3 py-2 text-xs text-foreground">
        {text}
      </div>
    </div>
  );
};

const nodeTypes = {
  entity: EntityNode,
  specificity: SpecificityNode,
};

export const CanvasTab = ({ entities, classes, onUpdateEntity }: CanvasTabProps) => {
  const [specificities, setSpecificities] = useState<Specificity[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogText, setDialogText] = useState('');
  const [dialogEntityId, setDialogEntityId] = useState<string | null>(null);
  const [dialogAttributeId, setDialogAttributeId] = useState<string | null>(null);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);

  // load all specificities
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/specificities', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setSpecificities(json.data as Specificity[]);
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
    // Chercher une spécificité existante pour cette paire entité-attribut
    const existing = specificities.find((s) => 
      s.attributeConnections.some(conn => 
        conn.entityId === entityId && conn.attributeId === attributeId
      )
    );
    setEditingSpecId(existing?.id ?? null);
    setDialogEntityId(entityId);
    setDialogAttributeId(attributeId);
    setDialogText(existing?.text ?? '');
    setDialogOpen(true);
  };

  const openSpecDialogForEdit = (specId: string) => {
    const spec = specificities.find((s) => s.id === specId);
    if (!spec) return;
    setEditingSpecId(spec.id);
    setDialogEntityId(null);
    setDialogAttributeId(null);
    setDialogText(spec.text);
    setDialogOpen(true);
  };

  const saveSpecificity = async () => {
    if (editingSpecId) {
      // Mise à jour du texte uniquement
      const res = await fetch('/api/specificities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingSpecId, text: dialogText }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data as Specificity;
        setSpecificities((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setDialogOpen(false);
      }
    } else {
      // Création d'une nouvelle spécificité
      if (!dialogEntityId || !dialogAttributeId) return;
      const res = await fetch('/api/specificities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: dialogText,
          attributeConnections: [{ entityId: dialogEntityId, attributeId: dialogAttributeId }],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const created = json.data as Specificity;
        setSpecificities((prev) => [...prev, created]);
        setDialogOpen(false);
      }
    }
  };

  // recompute nodes/edges from entities + attributes + specificities
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const processedSpecs = new Set<string>();

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
    });

    // Créer les nœuds de spécificité et les arêtes
    specificities.forEach((spec, idx) => {
      const sId = `spec-${spec.id}`;
      
      // Calculer la position par défaut
      let defaultPos = { x: 600, y: 100 + idx * 120 };
      if (spec.attributeConnections.length > 0) {
        const firstConn = spec.attributeConnections[0];
        const entity = entities.find((e) => e.id === firstConn.entityId);
        if (entity) {
          const ePos = entity.position || { x: 100, y: 100 };
          defaultPos = { x: ePos.x + 350, y: ePos.y };
        }
      }
      
      const sPos = spec.position || defaultPos;
      
      // Récupérer les noms des attributs connectés
      const connectedAttrs = spec.attributeConnections
        .map((conn) => findAttrMeta(conn.attributeId))
        .filter((meta, index, self) => 
          self.findIndex((m) => m.name === meta.name) === index
        );
      
      const firstAttr = connectedAttrs[0] || { name: 'Attribut', color: '#8b5cf6' };
      const displayName = connectedAttrs.length > 1 
        ? `${connectedAttrs.map(a => a.name).join(', ')}`
        : firstAttr.name;

      newNodes.push({
        id: sId,
        type: 'specificity',
        position: sPos,
        data: {
          text: spec.text,
          attributeName: displayName,
          color: firstAttr.color,
          onClick: () => openSpecDialogForEdit(spec.id),
        },
      });

      // Créer une arête pour chaque connexion
      spec.attributeConnections.forEach((conn) => {
        newEdges.push({
          id: `e-${conn.id}`,
          source: conn.entityId,
          sourceHandle: conn.attributeId,
          target: sId,
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [entities, classes, specificities, setNodes, setEdges]);

  const onConnect = useCallback(
    async (params: Connection) => {
      // Connexion entre un attribut (source) et une spécificité (target)
      if (!params.source || !params.target || !params.sourceHandle) return;
      
      const entityId = params.source;
      const attributeId = params.sourceHandle;
      const specificityId = params.target.replace('spec-', '');
      
      // Vérifier si c'est une spécificité
      if (!params.target.startsWith('spec-')) return;
      
      // Ajouter la connexion via l'API
      const res = await fetch('/api/specificities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addConnection',
          specificityId,
          entityId,
          attributeId,
        }),
      });
      
      if (res.ok) {
        // Recharger les spécificités
        const listRes = await fetch('/api/specificities', { cache: 'no-store' });
        if (listRes.ok) {
          const json = await listRes.json();
          setSpecificities(json.data as Specificity[]);
        }
      }
    },
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
            setSpecificities((prev) => 
              prev.map((s) => 
                s.id === json.data.id 
                  ? { ...s, position: json.data.position } 
                  : s
              )
            );
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
          nodeTypes={nodeTypes}
          fitView
          style={{ background: '#0b1220' }}
        >
          <Background color="#475569" size={1} gap={18} />
          <Controls style={{ color: '#0b1220' }}/>
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
