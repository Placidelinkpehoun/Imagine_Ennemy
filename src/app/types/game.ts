export interface Attribute {
  id: string;
  name: string;
  description?: string;
}

export interface GameClass {
  id: string;
  name: string;
  description?: string;
  color: string;
  attributes: Attribute[];
  parentId?: string;
}

export interface Entity {
  id: string;
  name: string;
  description?: string;
  attributeIds: string[];
  position?: { x: number; y: number };
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'attribute-entity';
}
