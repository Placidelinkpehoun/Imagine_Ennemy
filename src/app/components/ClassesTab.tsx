'use client';

import { useState } from 'react';
import { GameClass, Attribute } from '../types/game';
import { ClassCard } from './ClassCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus } from 'lucide-react';

interface ClassesTabProps {
  classes: GameClass[];
  onAddClass: (gameClass: Omit<GameClass, 'id'>) => void;
  onDeleteClass: (id: string) => void;
  onAddAttribute: (classId: string, attribute: Omit<Attribute, 'id'>) => void;
  onDeleteAttribute: (classId: string, attrId: string) => void;
}

const PRESET_COLORS = [
  '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899',
];

export const ClassesTab = ({
  classes,
  onAddClass,
  onDeleteClass,
  onAddAttribute,
  onDeleteAttribute,
}: ClassesTabProps) => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddAttrOpen, setIsAddAttrOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassColor, setNewClassColor] = useState(PRESET_COLORS[0]);
  
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrDesc, setNewAttrDesc] = useState('');

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    
    onAddClass({
      name: newClassName,
      description: newClassDesc,
      color: newClassColor,
      attributes: [],
    });
    
    setNewClassName('');
    setNewClassDesc('');
    setNewClassColor(PRESET_COLORS[0]);
    setIsAddClassOpen(false);
  };

  const handleAddAttribute = () => {
    if (!newAttrName.trim() || !selectedClassId) return;
    
    onAddAttribute(selectedClassId, {
      name: newAttrName,
      description: newAttrDesc,
    });
    
    setNewAttrName('');
    setNewAttrDesc('');
    setIsAddAttrOpen(false);
  };

  return (
    <>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Classes d'attributs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les catégories d'attributs pour vos ennemis
          </p>
        </div>
        
        <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle classe
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle classe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="class-name">Nom de la classe</Label>
                <Input
                  id="class-name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ex: Physique, Comportement..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="class-desc">Description (optionnel)</Label>
                <Textarea
                  id="class-desc"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Description de la classe..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Couleur</Label>
                <div className="flex gap-2 mt-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewClassColor(color)}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: newClassColor === color ? 'hsl(var(--primary))' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddClass} className="w-full">
                Créer la classe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((gameClass) => (
          <ClassCard
            key={gameClass.id}
            gameClass={gameClass}
            onDelete={() => onDeleteClass(gameClass.id)}
            onAddAttribute={() => {
              setSelectedClassId(gameClass.id);
              setIsAddAttrOpen(true);
            }}
            onDeleteAttribute={(attrId) => onDeleteAttribute(gameClass.id, attrId)}
          />
        ))}
      </div>

      <Dialog open={isAddAttrOpen} onOpenChange={setIsAddAttrOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Ajouter un attribut</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="attr-name">Nom de l'attribut</Label>
              <Input
                id="attr-name"
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
                placeholder="Ex: Ailé, Agressif..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="attr-desc">Description (optionnel)</Label>
              <Textarea
                id="attr-desc"
                value={newAttrDesc}
                onChange={(e) => setNewAttrDesc(e.target.value)}
                placeholder="Description de l'attribut..."
                className="mt-1.5"
              />
            </div>
            <Button onClick={handleAddAttribute} className="w-full">
              Ajouter l'attribut
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};
