'use client';

import { useState } from 'react';
import { Entity, GameClass, Attribute } from '../types/game';
import { EntityCard } from './EntityCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Dice5 } from 'lucide-react';

interface EntitiesTabProps {
  entities: Entity[];
  classes: GameClass[];
  onAddEntity: (entity: Omit<Entity, 'id'>) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateEntity: (id: string, updates: Partial<Entity>) => void;
}

export const EntitiesTab = ({
  entities,
  classes,
  onAddEntity,
  onDeleteEntity,
  onUpdateEntity,
}: EntitiesTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  
  const [entityName, setEntityName] = useState('');
  const [entityDesc, setEntityDesc] = useState('');
  const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);

  const allAttributes: Array<Attribute & { classId: string; className: string; classColor: string }> = [];
  classes.forEach((gameClass) => {
    gameClass.attributes.forEach((attr) => {
      allAttributes.push({
        ...attr,
        classId: gameClass.id,
        className: gameClass.name,
        classColor: gameClass.color,
      });
    });
  });

  const openDialog = (entity?: Entity) => {
    if (entity) {
      setEditingEntity(entity);
      setEntityName(entity.name);
      setEntityDesc(entity.description || '');
      setSelectedAttrIds(entity.attributeIds);
    } else {
      setEditingEntity(null);
      setEntityName('');
      setEntityDesc('');
      setSelectedAttrIds([]);
    }
    setIsDialogOpen(true);
  };

  const createRandomEntity = () => {
    // choisir un attribut aléatoire par classe
    const attrIds: string[] = [];
    classes.forEach((gc) => {
      if (gc.attributes.length > 0) {
        const idx = Math.floor(Math.random() * gc.attributes.length);
        attrIds.push(gc.attributes[idx].id);
      }
    });
    const randomName = `Entité ${Math.random().toString(36).slice(2, 7)}`;
    onAddEntity({ name: randomName, description: '', attributeIds: attrIds });
  };

  const handleSave = () => {
    if (!entityName.trim()) return;

    if (editingEntity) {
      onUpdateEntity(editingEntity.id, {
        name: entityName,
        description: entityDesc,
        attributeIds: selectedAttrIds,
      });
    } else {
      onAddEntity({
        name: entityName,
        description: entityDesc,
        attributeIds: selectedAttrIds,
      });
    }

    setIsDialogOpen(false);
  };

  const toggleAttribute = (attrId: string) => {
    setSelectedAttrIds((prev) =>
      prev.includes(attrId) ? prev.filter((id) => id !== attrId) : [...prev, attrId]
    );
  };

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Entités ennemies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Créez et gérez vos ennemis avec leurs attributs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => createRandomEntity()} 
            variant="secondary"
            className="transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            <Dice5 className="mr-2 h-4 w-4" />
            Entité aléatoire
          </Button>
          <Button 
            onClick={() => openDialog()} 
            className="bg-gradient-primary hover:opacity-90 transform hover:scale-105 transition-all duration-200 ease-in-out"
          >
            <Plus className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Nouvelle entité
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            classes={classes}
            onDelete={() => onDeleteEntity(entity.id)}
            onEdit={() => openDialog(entity)}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? 'Modifier l\'entité' : 'Créer une nouvelle entité'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="entity-name">Nom de l'entité</Label>
              <Input
                id="entity-name"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Ex: Chauve-Terreur, Liane Rampante..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="entity-desc">Description (optionnel)</Label>
              <Textarea
                id="entity-desc"
                value={entityDesc}
                onChange={(e) => setEntityDesc(e.target.value)}
                placeholder="Description de l'entité..."
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label className="mb-3 block">Attributs</Label>
              <div className="space-y-4">
                {classes.map((gameClass) => (
                  <div key={gameClass.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: gameClass.color }}
                      />
                      <span className="font-medium text-sm">{gameClass.name}</span>
                    </div>
                    <div className="pl-5 space-y-2">
                      {gameClass.attributes.map((attr) => (
                        <div key={attr.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={attr.id}
                            checked={selectedAttrIds.includes(attr.id)}
                            onCheckedChange={() => toggleAttribute(attr.id)}
                          />
                          <label
                            htmlFor={attr.id}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {attr.name}
                            {attr.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({attr.description})
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Button onClick={handleSave} className="w-full">
              {editingEntity ? 'Enregistrer' : 'Créer l\'entité'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};
