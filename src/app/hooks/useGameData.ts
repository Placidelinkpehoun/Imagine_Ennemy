'use client';

import { useState, useEffect } from 'react';
import { GameClass, Entity, Attribute } from '../types/game';

const STORAGE_KEY = 'enemy-designer-data';

interface GameData {
  classes: GameClass[];
  entities: Entity[];
}

const defaultData: GameData = {
  classes: [
    {
      id: '1',
      name: 'Physique',
      color: '#8b5cf6',
      attributes: [
        { id: 'attr-1', name: 'Poilu', description: 'Couvert de fourrure' },
        { id: 'attr-2', name: 'Ailé', description: 'Possède des ailes' },
        { id: 'attr-3', name: 'Cornu', description: 'Possède des cornes' },
      ],
    },
    {
      id: '2',
      name: 'Comportement',
      color: '#ef4444',
      attributes: [
        { id: 'attr-4', name: 'Agressif', description: 'Attaque à vue' },
        { id: 'attr-5', name: 'Territorial', description: 'Défend son territoire' },
        { id: 'attr-6', name: 'Fuyant', description: 'Évite le combat' },
      ],
    },
  ],
  entities: [
    {
      id: 'entity-1',
      name: 'Chauve-Terreur',
      description: 'Une créature nocturne dangereuse',
      attributeIds: ['attr-2', 'attr-4'],
      position: { x: 100, y: 100 },
    },
  ],
};

export const useGameData = () => {
  const [data, setData] = useState<GameData>(defaultData);

  useEffect(() => {
    // Initialiser les données depuis localStorage uniquement côté client
    const storedData = window.localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (e) {
        console.error('Erreur lors du chargement des données:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Sauvegarder dans localStorage uniquement côté client
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addClass = (gameClass: Omit<GameClass, 'id'>) => {
    const newClass: GameClass = {
      ...gameClass,
      id: `class-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, classes: [...prev.classes, newClass] }));
  };

  const updateClass = (id: string, updates: Partial<GameClass>) => {
    setData((prev) => ({
      ...prev,
      classes: prev.classes.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteClass = (id: string) => {
    setData((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== id),
    }));
  };

  const addEntity = (entity: Omit<Entity, 'id'>) => {
    const newEntity: Entity = {
      ...entity,
      id: `entity-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, entities: [...prev.entities, newEntity] }));
  };

  const updateEntity = (id: string, updates: Partial<Entity>) => {
    setData((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteEntity = (id: string) => {
    setData((prev) => ({
      ...prev,
      entities: prev.entities.filter((e) => e.id !== id),
    }));
  };

  const addAttributeToClass = (classId: string, attribute: Omit<Attribute, 'id'>) => {
    const newAttr: Attribute = {
      ...attribute,
      id: `attr-${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classId ? { ...c, attributes: [...c.attributes, newAttr] } : c
      ),
    }));
  };

  const deleteAttribute = (classId: string, attrId: string) => {
    setData((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classId
          ? { ...c, attributes: c.attributes.filter((a) => a.id !== attrId) }
          : c
      ),
    }));
  };

  return {
    classes: data.classes,
    entities: data.entities,
    addClass,
    updateClass,
    deleteClass,
    addEntity,
    updateEntity,
    deleteEntity,
    addAttributeToClass,
    deleteAttribute,
  };
};
