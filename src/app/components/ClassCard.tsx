import { GameClass } from '../types/game';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface ClassCardProps {
  gameClass: GameClass;
  onDelete: () => void;
  onAddAttribute: () => void;
  onDeleteAttribute: (attrId: string) => void;
}

export const ClassCard = ({ gameClass, onDelete, onAddAttribute, onDeleteAttribute }: ClassCardProps) => {
  return (
    <>
    <Card className="p-4 bg-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: gameClass.color }}
          />
          <h3 className="font-semibold text-lg">{gameClass.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {gameClass.description && (
        <p className="text-sm text-muted-foreground mb-3">{gameClass.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/80">Attributs</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddAttribute}
            className="h-7 text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {gameClass.attributes.map((attr) => (
            <Badge
              key={attr.id}
              variant="secondary"
              className="group relative pr-7 hover:bg-secondary/80"
            >
              {attr.name}
              <button
                onClick={() => onDeleteAttribute(attr.id)}
                className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </Card>
    </>
  );
};
