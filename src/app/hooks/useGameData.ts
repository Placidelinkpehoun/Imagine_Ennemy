'use client';

import { useState, useEffect } from 'react';
import { GameClass, Entity, Attribute } from '../types/game';

interface GameData {
  classes: GameClass[];
  entities: Entity[];
}

const defaultData: GameData = {
  classes: [],
  entities: [],
};

export const useGameData = () => {
  const [data, setData] = useState<GameData>(defaultData);

  useEffect(() => {
    // Charger classes et entités depuis l'API (base de données)
    const load = async () => {
      try {
        const [gcRes, entRes] = await Promise.all([
          fetch('/api/game-classes', { cache: 'no-store' }),
          fetch('/api/entities', { cache: 'no-store' }),
        ]);
        if (!gcRes.ok) throw new Error('Failed to fetch classes');
        if (!entRes.ok) throw new Error('Failed to fetch entities');
        const gcJson = await gcRes.json();
        const entJson = await entRes.json();
        setData({
          classes: gcJson.data as GameClass[],
          entities: entJson.data as Entity[],
        });
      } catch (e) {
        console.error('Erreur lors du chargement des classes:', e);
      }
    };
    load();
  }, []);

  const addClass = async (gameClass: Omit<GameClass, 'id'>) => {
    try {
      const res = await fetch('/api/game-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameClass.name,
          description: gameClass.description,
          color: gameClass.color,
          parentId: (gameClass as any).parentId,
          attributeIds: [],
        }),
      });
      if (!res.ok) throw new Error('Failed to create class');
      const json = await res.json();
      setData((prev) => ({ ...prev, classes: [json.data as GameClass, ...prev.classes] }));
    } catch (e) {
      console.error('Erreur lors de la création de la classe:', e);
    }
  };

  const updateClass = async (id: string, updates: Partial<GameClass>) => {
    try {
      const res = await fetch(`/api/game-classes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update class');
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        classes: prev.classes.map((c) => (c.id === id ? (json.data as GameClass) : c)),
      }));
    } catch (e) {
      console.error('Erreur lors de la mise à jour de la classe:', e);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const res = await fetch(`/api/game-classes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete class');
      // recharger pour rester cohérent (enfants délier, etc.)
      const gcRes = await fetch('/api/game-classes', { cache: 'no-store' });
      if (gcRes.ok) {
        const gcJson = await gcRes.json();
        setData((prev) => ({ ...prev, classes: gcJson.data as GameClass[] }));
      } else {
        setData((prev) => ({ ...prev, classes: prev.classes.filter((c) => c.id !== id) }));
      }
    } catch (e) {
      console.error('Erreur lors de la suppression de la classe:', e);
    }
  };

  const addEntity = async (entity: Omit<Entity, 'id'>) => {
    try {
      const res = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
      });
      if (!res.ok) throw new Error('Failed to create entity');
      const json = await res.json();
      // re-fetch to garantir que les entity_attributes sont bien écrits
      const entRes = await fetch('/api/entities', { cache: 'no-store' });
      if (entRes.ok) {
        const entJson = await entRes.json();
        setData((prev) => ({ ...prev, entities: entJson.data as Entity[] }));
      } else {
        setData((prev) => ({ ...prev, entities: [json.data as Entity, ...prev.entities] }));
      }
    } catch (e) {
      console.error('Erreur lors de la création de l\'entité:', e);
    }
  };

  const updateEntity = async (id: string, updates: Partial<Entity>) => {
    try {
      const res = await fetch(`/api/entities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update entity');
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        entities: prev.entities.map((e) => (e.id === id ? (json.data as Entity) : e)),
      }));
    } catch (e) {
      console.error('Erreur lors de la mise à jour de l\'entité:', e);
    }
  };

  const deleteEntity = async (id: string) => {
    try {
      const res = await fetch(`/api/entities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete entity');
      setData((prev) => ({ ...prev, entities: prev.entities.filter((e) => e.id !== id) }));
    } catch (e) {
      console.error('Erreur lors de la suppression de l\'entité:', e);
    }
  };

  const addAttributeToClass = async (classId: string, attribute: Omit<Attribute, 'id'>) => {
    try {
      // 1) créer l'attribut
      const createAttrRes = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attribute),
      });
      if (!createAttrRes.ok) throw new Error('Failed to create attribute');
      const createdAttr = (await createAttrRes.json()).data as Attribute;

      // 2) lier l'attribut à la classe
      const linkRes = await fetch(`/api/game-classes/${classId}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributeId: createdAttr.id }),
      });
      if (!linkRes.ok && linkRes.status !== 409) throw new Error('Failed to link attribute to class');

      // 3) re-fetch pour garantir que game_class_attributes est écrit
      const gcRes = await fetch('/api/game-classes', { cache: 'no-store' });
      if (gcRes.ok) {
        const gcJson = await gcRes.json();
        setData((prev) => ({ ...prev, classes: gcJson.data as GameClass[] }));
      } else {
        setData((prev) => ({
          ...prev,
          classes: prev.classes.map((c) =>
            c.id === classId ? { ...c, attributes: [...c.attributes, createdAttr] } : c
          ),
        }));
      }
    } catch (e) {
      console.error('Erreur lors de l\'ajout de l\'attribut à la classe:', e);
    }
  };

  const deleteAttribute = async (classId: string, attrId: string) => {
    try {
      const res = await fetch(`/api/game-classes/${classId}/attributes/${attrId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unlink attribute from class');
      setData((prev) => ({
        ...prev,
        classes: prev.classes.map((c) =>
          c.id === classId
            ? { ...c, attributes: c.attributes.filter((a) => a.id !== attrId) }
            : c
        ),
      }));
    } catch (e) {
      console.error('Erreur lors de la suppression de l\'attribut de la classe:', e);
    }
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
