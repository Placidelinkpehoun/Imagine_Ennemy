import { Entity, GameClass } from '../types/game';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface EntityCardProps {
  entity: Entity;
  classes: GameClass[];
  onDelete: () => void;
  onEdit: () => void;
}

export const EntityCard = ({ entity, classes, onDelete, onEdit }: EntityCardProps) => {
  const getAttributeDetails = () => {
    const attributes: { name: string; className: string; color: string }[] = [];
    
    entity.attributeIds.forEach((attrId) => {
      classes.forEach((gameClass) => {
        const attr = gameClass.attributes.find((a) => a.id === attrId);
        if (attr) {
          attributes.push({
            name: attr.name,
            className: gameClass.name,
            color: gameClass.color,
          });
        }
      });
    });
    
    return attributes;
  };

  const attributes = getAttributeDetails();

  return (
    <>
    <Card className="p-4 border-entityCard/20 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-entityCard">{entity.name}</h3>
          {entity.description && (
            <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 text-foreground/60 hover:bg-primary/10 hover:text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
          Attributs liés
        </span>
        <div className="flex flex-wrap gap-2">
          {attributes.map((attr, idx) => (
            <Badge
              key={idx}
              className="text-xs w-fit"
              style={{
                backgroundColor: `${attr.color}20`,
                color: attr.color,
                borderColor: attr.color,
              }}
            >
              {attr.name}
            </Badge>
          ))}
          {attributes.length === 0 && (
            <span className="text-sm text-muted-foreground italic">Aucun attribut</span>
          )}
        </div>
      </div>
    </Card>
    </>
  );
};
